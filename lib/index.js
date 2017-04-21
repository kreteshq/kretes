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

const debug = require('debug')('huncwot:application');

const http = require('http');
const Emitter = require('events');
const Stream = require('stream');
const assert = require('assert');
const rawBody = require('raw-body');
const querystring = require('querystring');
const nunjucks = require('nunjucks');

const { pick, compose } = require('./util');

nunjucks.configure('views', { autoescape: true });

class Application extends Emitter {
  constructor() {
    super();

    this.middlewareList = [];
  }

  listen() {
    debug('listen');
    const server = http.createServer(async (request, response) => {
      const context = {
        params: {},
        request,
        response,
        render: (view, bindings) => {
          context.body = nunjucks.render(view, bindings)
        }
      };

      await compose(
        handleRoute,
        handleError,
        ...this.middlewareList,
        notFound
      )(context);
    })

    return server.listen.apply(server, arguments);
  }

  use(func) {
    if (typeof func !== 'function') {
      throw new TypeError('middleware must be a function');
    }

    debug(`use: '%s'`, func.name || '-');

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
    if (context.request.method === method && context.request.url === path) {
      context.response.statusCode = 200;
      context.body = await func(context) || context.body;
    } else {
      await next();
    }
  }
}

async function handleError(context, next) {
  try {
    await next()
  } catch (error) {
    assert(error instanceof Error, `non-error thrown: ${error}`);

    if (error instanceof HTTPError) {
      context.response.statusCode = error.statusCode;
      context.body = error.message;
    } else {
      context.response.statusCode = 500;
      context.body = error.message;
    }
  }
}

async function handleRoute(context, next) {
  const buffer = await rawBody(context.request);

  if (buffer.length > 0) {
    const contentType = context.request.headers['content-type'].split(';')[0];

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        Object.assign(context.params, querystring.parse(buffer.toString()))
        break;
      case 'application/json':
        Object.assign(context.params, JSON.parse(buffer))
        break;
      default:
    }
  }

  await next()

  const res = context.response;
  const code = context.statusCode;
  let body = context.body;

  if (body === null) {
    res.end();
    return;
  }

  if (Buffer.isBuffer(body)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    res.setHeader('Content-Length', body.length);
    res.end(body);
    return;
  }

  if (body instanceof Stream) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    body.pipe(res);
    return;
  }

  let str = body;

  if (typeof body === 'object' || typeof body === 'number') {
    str = JSON.stringify(body);

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str));
  res.end(str);
}

async function notFound() {
  throw new HTTPError(404, `There's no such route.`);
}

class HTTPError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// XXX how to do `response` compression
function respond(content, statusCode = 200) {
  return {

  }
}

function json(content, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(content),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

function redirect(url) {
  return {
    statusCode: 302,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Location': url
    },
    body: `Redirecting to ${url}.`
  }
}

module.exports = Application;
