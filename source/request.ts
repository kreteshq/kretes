// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Schema from 'validate';

import { JSONPayload } from './response';

const validate = shape => {
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

export {
  validate,
};
