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

const { unauthorized, created } = require('./response.js');
const basicAuth = require('basic-auth');
const db = require('./db.js');
const Cookie = require('./cookie.js');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const compare = bcrypt.compare;
const hash = bcrypt.hash;

const fromBase64 = base64 =>
  base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

function auth({ users }) {
  return async (context, next) => {
    const credentials = basicAuth(context.request);

    if (
      credentials &&
      credentials.name &&
      credentials.pass &&
      check(credentials)
    ) {
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
      if (name === k && pass == users[k]) {
        return true;
      }
    }
    return false;
  }
}

const can = func => {
  return async request => {
    const { cookies, headers, params } = request;

    if (token) {
      const hash = sha256.update(token).digest('base64');
      const [found] = await db`session`({ token: hash });
      return found ? await func(request) : unauthorized();
    } else {
      return unauthorized();
    }
  };
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

  const hashed_password = await hash(password, 10);

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

    return created(
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
    const { id: person_id, password: actual_password } = person;

    const match = await compare(password, actual_password);

    if (match) {
      const token = await Session.create(person_id);
      const { password, ...rest } = person; // delete is slow, use spread instead
      return created(Object.assign({ token }, rest), {
        'Set-Cookie': Cookie.create('__hcsession', token, {
          httpOnly: true,
          sameSite: true
        })
      });
    } else {
      return unauthorized();
    }
  } else {
    return unauthorized();
  }
};

module.exports = { auth, can, hash, compare, Session, register, login };
