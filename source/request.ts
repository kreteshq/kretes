// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Middleware } from 'retes';
import Schema, { SchemaDefinition } from 'validate';

import { JSONPayload } from './response';
import Cookie from './cookie';

function validation(shape: SchemaDefinition): Middleware {
  const schema = new Schema(shape);

  return next => request => {
    const { params } = request;
    const errors = schema.validate(params);

    if (errors.length) {
      // @ts-ignore
      const r = errors.reduce((stored, { path, message }) => {
        stored[path] = (stored[path] || []).concat(message)
        return stored;
      }, {});
      return JSONPayload(r, 422);
    } else {
      return next(request);
    }
  };
};

const Header = {
  ExpiredCookie: {
    'Set-Cookie': Cookie.create('__ks_session', '', {
      httpOnly: true,
      expires: new Date(Date.UTC(1985, 11, 24, 10, 30, 59, 900)),
      sameSite: true
    })
  }
}

export {
  Header,
  validation,
};
