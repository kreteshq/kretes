// Copyright 2018 Zaiste & contributors. All rights reserved.
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

const { unauthorized } = require('./response.js');
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
    const [r] = await db`session`({ token });
    if (r) {
      return await func(request);
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

module.exports = { auth, can, hash, compare, Session };
