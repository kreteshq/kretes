// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('kretes:routing');

const assert = require('assert');
const querystring = require('querystring');
const { parse } = require('url');
const Busboy = require('busboy');

const {
  isObject,
  parseCookies,
  parseAcceptHeader,
  toBuffer,
} = require('../util');

const Routing = (router, options = {}) => {
  return async (context, next) => {
    const method = context.request.method;
    const { pathname, query } = parse(context.request.url, true); // TODO Test perf vs RegEx

    const [handler, dynamicRoutes] = router.find(method, pathname);

    const params = {};
    for (let r of dynamicRoutes) {
      params[r.name] = r.value;
    }

    if (handler !== undefined) {
      context.params = { ...query, ...params };
      await handleRequest(context);
      context.params = { ...context.params };
      return handler(context);
    } else {
      return next();
    }
  };
}

const handleRequest = async context => {
  const { headers } = context.request;
  const { format } = context.params;

  context.headers = headers;
  context.cookies = parseCookies(headers.cookie);
  context.format = format ? format : parseAcceptHeader(headers);

  const buffer = await toBuffer(context.request);
  if (buffer.length > 0) {
    const contentType = headers['content-type'].split(';')[0];

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        Object.assign(context.params, querystring.parse(buffer.toString()));
        break;
      case 'application/json': {
        const result = JSON.parse(buffer);
        if (isObject(result)) {
          Object.assign(context.params, result);
        }
        break;
      }
      case 'multipart/form-data': {
        context.files = {};

        const busboy = new Busboy({ headers });

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          file.on('data', data => {
            context.files = {
              ...context.files,
              [fieldname]: {
                name: filename,
                length: data.length,
                data,
                encoding,
                mimetype,
              }
            };
          });
          file.on('end', () => {});
        });
        busboy.on('field', (fieldname, val) => {
          context.params = { ...context.params, [fieldname]: val };
        });
        busboy.end(buffer);

        await new Promise(resolve => busboy.on('finish', resolve));

        break;
      }
      default:
    }
  }
};

module.exports = Routing;
