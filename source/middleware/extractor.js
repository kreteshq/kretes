// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('ks:middleware:extractor');

const { parse } = require('url');

module.exports = () => {
  return async (context, next) => {
    const method = context.request.method;
    const { pathname, query } = parse(context.request.url, true); // TODO Test perf vs RegEx

    Object.assign(context, { path: pathname, query, method });

    return next();
  };
};
