// Copyright 2017 Zaiste & contributors. All rights reserved.
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

const debug = require('debug')('huncwot:core');

const http = require('http');
const Emitter = require('events');
const Stream = require('stream');
const assert = require('assert');
const rawBody = require('raw-body');
const querystring = require('querystring');
const extractParams = require('path-to-regexp');

const { pick, compose, match, isObject } = require('./util');

class Huncwot extends Emitter {
  constructor() {
    super();

    this.middlewareList = [];
  }

  listen() {
    debug('listen');
    const server = http.createServer(async (request, response) => {
      const context = {
        params: {},
        headers: {},
        request,
        response
      };

      try {
        await compose(
          handleRoute(response),
          handleError,
          ...this.middlewareList,
          notFound
        )(context);
      } catch (e) {
        response.statusCode = 500;
        response.end();
      }
    });

    return server.listen.apply(server, arguments);
  }

  use(func) {
    if (typeof func !== 'function') {
      throw new TypeError('middleware must be a function');
    }

    debug('use: \'%s\'', func.name || '-');

    this.middlewareList.push(func);

    return this;
  }

  get(path, func) {
    this.use(route('GET', path, func));
  }

  post(path, func) {
    this.use(route('POST', path, func));
  }

  put(path, func) {
    this.use(route('PUT', path, func));
  }

  patch(path, func) {
    this.use(route('PATCH', path, func));
  }

  delete(path, func) {
    this.use(route('DELETE', path, func));
  }
}

function route(method, path, func) {
  return async (context, next) => {
    const { pathname, query } = require('url').parse(context.request.url, true);
    const params = match()(path)(pathname);

    if (context.request.method === method && params) {
      Object.assign(context.params, params, query);
      return await func(context);
    } else {
      return await next();
    }
  };
}

async function handleError(context, next) {
  try {
    return await next();
  } catch (error) {
    assert(error instanceof Error, `non-error thrown: ${error}`);

    if (error instanceof HTTPError) {
      return { statusCode: error.statusCode, body: error.message };
    } else {
      return { statusCode: 500, body: error.message };
    }
  }
}

function handleRoute(response) {
  return async (context, next) => {
    context.headers = context.request.headers;
    const buffer = await rawBody(context.request);

    if (buffer.length > 0) {
      const contentType = context.request.headers['content-type'].split(';')[0];

      switch (contentType) {
      case 'application/x-www-form-urlencoded':
        Object.assign(context.params, querystring.parse(buffer.toString()));
        break;
      case 'application/json':
        const result = JSON.parse(buffer);
        if (isObject(result)) {
          Object.assign(context.params, result);
        }
        break;
      default:
      }
    }

    let r = await next();
    if (!r) throw new Error('One of your routes does not return a value. You probably forgot a `return` statement.');

    let body;
    let headers;
    let type;
    let encoding;

    response.statusCode = r.statusCode || 200;

    if (typeof r === 'string' || r instanceof Stream) {
      body = r;
    } else {
      body = r.body;
      headers = r.headers;
      type = r.type;
      encoding = r.encoding;
    }

    for (var key in headers) {
      response.setHeader(key, headers[key]);
    }

    if (encoding) response.setHeader('Content-Encoding', encoding);

    if (body === null) {
      response.end();
      return;
    }

    if (Buffer.isBuffer(body)) {
      response.setHeader('Content-Type', type || 'application/octet-stream');
      response.setHeader('Content-Length', body.length);
      response.end(body);
      return;
    }

    if (body instanceof Stream) {
      if (! response.getHeader('Content-Type'))
        response.setHeader('Content-Type', type || 'text/html');

      body.pipe(response);
      return;
    }

    let str = body;

    if (typeof body === 'object' || typeof body === 'number') {
      str = JSON.stringify(body);
      response.setHeader('Content-Type', 'application/json');
    } else {
      if (! response.getHeader('Content-Type'))
        response.setHeader('Content-Type', type || 'text/plain');
    }

    response.setHeader('Content-Length', Buffer.byteLength(str));
    response.end(str);
  };
}

async function notFound() {
  throw new HTTPError(404, 'There\'s no such route.');
}

class HTTPError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = Huncwot;
