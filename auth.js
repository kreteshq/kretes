// Copyright 2019 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { ForbiddenError } = require('@casl/ability');
const basicAuth = require('basic-auth');
const argon2 = require('argon2');
const crypto = require('crypto');

const { Unauthorized, Created, Forbidden, InternalServerError } = require('./response.js');
const db = require('./db.js');
const Cookie = require('./cookie.js');

const compare = argon2.verify;
const hash = argon2.hash;

const fromBase64 = base64 =>
  base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

function auth({ users }) {
  return async (context, next) => {
    const credentials = basicAuth(context.request);

    if (credentials && credentials.name && credentials.pass && check(credentials)) {
      return next();
    } else {
      return {
        headers: {
          'WWW-Authenticate': 'Basic realm=Authorization Required'
        },
        statusCode: 401,
        body: ''
      };
    }
  };

  // closure over `users`
  function check({ name, pass }) {
    for (let k in users) {
      if (name === k && pass === users[k]) {
        return true;
      }
    }
    return false;
  }
}

const bearer = (authorization = '') =>
  authorization.startsWith('Bearer ') ? authorization.substring(7) : undefined;

const authenticate = action => async request => {
  const { cookies = {}, headers = {}, params = {} } = request;

  const token = cookies.__hcsession || bearer(headers.authorization) || params.token;

  if (!token) return Unauthorized();

  const sha256 = crypto.createHash('sha256');
  const hashedToken = sha256.update(token).digest('base64');
  const [found] = await db`person`.join`session`.on`person.id = session.person_id`
    .where`token = ${hashedToken}`;

  if (found) {
    request.user = found;

    return action(request);
  } else {
    // HTTP 401 Unauthorized is for authentication, not authorization (!)
    return Unauthorized();
  }
};

// authorization: a noun, as it leads to creating a process once
// both

const authorization = ({ using: rules }) => ({
  permission = 'read',
  entity = 'all'
}) => action => async request => {
  const { user } = request;
  const permissions = rules(user);

  try {
    permissions.throwUnlessCan(permission, entity);

    return action(request);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Forbidden(error.message);
    } else {
      return InternalServerError(error.message);
    }
  }
};

class Session {
  static async create(person_id) {
    const token = await new Promise((resolve, reject) => {
      crypto.randomBytes(16, (error, data) => {
        error ? reject(error) : resolve(fromBase64(data.toString('base64')));
      });
    });

    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(token).digest('base64');

    await db`session`.insert({ token: hash, person_id });

    return token;
  }
}

const register = ({ table = 'person', fields = [] }) => async ({ params }) => {
  const { password } = params;

  const hashed_password = await hash(password);

  let person = {};
  for (let field of fields) {
    person[field] = params[field];
  }
  Object.assign(person, { password: hashed_password });

  const transaction = await db.transaction();

  try {
    const [{ id: person_id }] = await db
      .from(table)
      .insert(person)
      .return('id');

    // TODO generalize this so people are not force to use `person` table
    const token = await Session.create(person_id);

    await transaction.commit();

    return Created(
      { person_id, token },
      {
        'Set-Cookie': Cookie.create('__hcsession', token, {
          httpOnly: true,
          sameSite: true
        })
      }
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = ({ finder = () => {} } = {}) => async ({ params }) => {
  const { password } = params;

  const [person] = await finder(params);

  if (person) {
    const { id: person_id, password: hashed_password } = person;

    const match = await compare(hashed_password, password);

    if (match) {
      const token = await Session.create(person_id);
      const { password: _, ...rest } = person; // delete is slow, use spread instead
      return Created(Object.assign({ token }, rest), {
        'Set-Cookie': Cookie.create('__hcsession', token, {
          httpOnly: true,
          sameSite: true
        })
      });
    } else {
      return Unauthorized();
    }
  } else {
    return Unauthorized();
  }
};

module.exports = {
  auth,
  authenticate,
  authorization,
  hash,
  compare,
  Session,
  register,
  login
};
