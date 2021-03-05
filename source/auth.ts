// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Handler, Request } from "retes";
import { Ability, ForbiddenError } from '@casl/ability';
import basicAuth from 'basic-auth';
import argon2 from 'argon2';
import crypto from 'crypto';

import { Unauthorized, Created, Forbidden, InternalServerError } from './response';
import db from './db';
import Cookie from './cookie';
import { Middleware } from ".";
import { Finder } from "./types";

const compare = argon2.verify;
const hash = argon2.hash;

const fromBase64 = (base64: string) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const findUserByToken = async (token: string) => 
  await db.from('person').join`session`.on`person.id = session.person_id`
    .where`token = ${token}`
    .return`person.*`;

function auth({ users }) {
  return async (context, next) => {
    const credentials = basicAuth(context.request);

    if (credentials && credentials.name && credentials.pass && check(credentials)) {
      return next();
    } else {
      return Unauthorized();
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

const makeSHA256asBase64 = (input: string) =>
  crypto
    .createHash('sha256')
    .update(input)
    .digest('base64');

const authenticate: Middleware = action => async request => {
  const { cookies = {}, headers = {}, params = {} } = request;

  //@ts-ignore
  const token = cookies.__ks_session || bearer(headers.authorization) || params.token;

  if (!token) return Unauthorized();

  const hashedToken = makeSHA256asBase64(token) 
  const [found] = await findUserByToken(hashedToken);

  if (found) {
    const { password: _, ...user } = found; // delete is slow, use spread instead
    request.user = user;

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
}) => (action: any) => async (request: Request) => {
  const { user } = request;
  const permissions = rules(user) as Ability;

  try {
    ForbiddenError.from(permissions).throwUnlessCan(permission, entity);

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
  static async create(person_id, transaction = null): Promise<string> {
    const token = await new Promise<string>((resolve, reject) => {
      crypto.randomBytes(16, (error, data) => {
        error ? reject(error) : resolve(fromBase64(data.toString('base64')));
      });
    });

    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(token).digest('base64');

    if (transaction) {
      await db.from('session').insert({ token: hash, person_id }).one(transaction);
    } else {
      await db.from('session').insert({ token: hash, person_id });
    }

    return token;
  }
}

function register({ table = 'person', fields = [] } = {}): Handler {
  return async ({ params }) => {
    const { password } = params;

    const hashed_password = await hash(password);

    let person = {};
    for (let field of fields) {
      person[field] = params[field];
    }
    Object.assign(person, { password: hashed_password });

    const transaction = await db.transaction();

    try {
      // @ts-ignore
      const { id: person_id } = await db
        .from(table)
        .insert(person)
        .return('id')
        .one(transaction);

      // TODO generalize this so people are not force to use `person` table
      const token = await Session.create(person_id, transaction);

      await transaction.commit();

      return Created(
        { person_id, token },
        {
          'Set-Cookie': Cookie.create('__ks_session', token, {
            httpOnly: true,
            sameSite: true,
          })
        }
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

function login(finder: Finder): Handler {
  return async ({ params }) => {
    const { password } = params;

    const [person] = await finder(params);

    if (person) {
      const { id: person_id, password: hashed_password } = person;

      try {
        const match = await compare(hashed_password, password);

        if (match) {
          const token = await Session.create(person_id);
          const { password: _, ...rest } = person; // delete is slow, use spread instead
          return Created(Object.assign({ token }, rest), {
            'Set-Cookie': Cookie.create('__ks_session', token, {
              httpOnly: true,
              sameSite: true
            })
          });
        } else {
          return Unauthorized();
        }
      } catch (error) {
        // FIXME Log internally the issue
        console.error(error.message);

        return Unauthorized();
      }
    } else {
      return Unauthorized();
    }
  }
}

const recognize: Middleware = action => async request => {
  const { cookies = {} } = request;

  // @ts-ignore
  const token = cookies.__ks_session;

  if (token) {
    const hashedToken = makeSHA256asBase64(token);
    const [found] = await findUserByToken(hashedToken);

    if (found) {
      const { password: _, ...user } = found; // delete is slow, use spread instead
      request.user = user;
    }
  }

  return action(request);
};

export {
  auth,
  authenticate,
  authorization,
  hash,
  compare,
  Session,
  register,
  login,
  recognize,
  Finder,
};
