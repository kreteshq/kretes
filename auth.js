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

const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    const { token } = request.params;

    if (token) {
      const [r] = await db`session`({ token });
      if (r) {
        return await func(request);
      } else {
        return unauthorized();
      }
    } else {
      return unauthorized();
    }
  };
};

const compare = bcrypt.compare;
const hash = bcrypt.hash;

class Session {
  static async create(person_id) {
    const token = await new Promise((resolve, reject) => {
      crypto.randomBytes(16, (error, data) => {
        error ? reject(error) : resolve(data.toString('base64'));
      });
    });

    await db`session`.insert({ token, person_id });

    return token;
  }
}

const register = ({
  table = 'person',
  finder = 'email',
  fields = []
}) => async ({ params }) => {
  const { password } = params;
  const value = params[finder];

  const hashed_password = await hash(password, 10);

  let person = {};
  for (let field of fields) {
    person[field] = params[field];
  }
  Object.assign(person, { [finder]: value, password: hashed_password });

  const transaction = await db.transaction();

  try {
    const [{ id: person_id }] = await db
      .from(table)
      .insert(person)
      .return('id');

    const token = await Session.create(person_id);

    await transaction.commit();

    return created({ person_id, token });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = ({
  table = 'person',
  finder = 'email',
  fields = []
} = {}) => async ({ params }) => {
  const { password } = params;
  const value = params[finder];

  const [person] = await db
    .from(table)
    .where({ email: value })
    .return('id', 'password', finder, ...fields);

  if (person) {
    const { id: person_id, password: actual_password } = person;

    const match = await compare(password, actual_password);

    if (match) {
      const token = await Session.create(person_id);
      return created(Object.assign({ token }, person));
    } else {
      return unauthorized();
    }
  } else {
    return unauthorized();
  }
};

module.exports = { auth, can, hash, compare, Session, register, login };
