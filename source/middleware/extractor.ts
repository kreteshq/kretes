// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:middleware:extractor'); // eslint-disable-line no-unused-vars

import { parse } from 'url';

export const Extractor = () => {
  return async (context, next) => {
    const method = context.request.method;
    const { pathname, query } = parse(context.request.url, true); // TODO Test perf vs RegEx

    Object.assign(context, { path: pathname, query, method });

    return next();
  };
};
