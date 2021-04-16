// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
import { Middleware } from 'retes';
const debug = Debug('ks:middleware:extractor'); // eslint-disable-line no-unused-vars

import { parse } from 'url';

export const Extractor = (): Middleware => {
  return next => request => {
    const method = request.method;
    const { pathname, query } = parse(request.url, true); // TODO Test perf vs RegEx

    Object.assign(request, { path: pathname, query, method });

    return next(request);
  };
};
