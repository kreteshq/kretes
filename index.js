// Copyright 2019 Zaiste & contributors. All rights reserved.
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

const debug = require('debug')('huncwot:index'); // eslint-disable-line no-unused-vars

const http = require('http');
const Stream = require('stream');
const querystring = require('querystring');
const { join } = require('path');
const { parse } = require('url');
const Busboy = require('busboy');
const Router = require('trek-router');
const Youch = require('youch');

const { serve, security } = require('./middleware');
const { list, translate } = require('./handlers');
const Logger = require('./logger');

const cwd = process.cwd();
const handlerDir = join(cwd, '.build');

const isObject = _ => !!_ && _.constructor === Object;
const compose = (...functions) => args =>
  functions.reduceRight((arg, fn) => fn(arg), args);

class Middleware extends Array {
  async next(context, last, current, done, called, func) {
    if ((done = current > this.length)) return;

    func = this[current] || last;

    return (
      func &&
      func(context, async () => {
        if (called) throw new Error('next() already called');
        called = true;
        return await this.next(context, last, current + 1);
      })
    );
  }

  async compose(context, last) {
    return await this.next(context, last, 0);
  }
}

class Huncwot {
  constructor({
    staticDir = join(cwd, 'static'),
    securityOptions = {
      dnsPrefetchControl: false,
      poweredBy: false
    },
    graphql = false,
    handlers = true,
    _verbose = false
  } = {}) {
    this.middlewareList = new Middleware();
    this.router = new Router();

    if (graphql) {
      try {
        const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
        const { graphql, graphiql, makeSchema } = require('./graphql');

        const schema = makeSchema({ typeDefs, resolvers });

        this.post('/graphql', graphql({ schema }));
        this.get('/graphql', graphql({ schema }));
        this.get('/graphiql', graphiql({ endpointURL: 'graphql' }));
      } catch (error) {
        switch (error.code) {
          case 'MODULE_NOT_FOUND':
            console.log('GraphQL is not set up.');
            break;
          default:
            console.error(error);
            break;
        }
      }
    }

    if (handlers) {
      const handlers = list();
      for (let { resource, operation, path } of handlers) {
        try {
          const handler = require(join(handlerDir, path));
          let { method, route } = translate(operation, resource);
          this[method](route, request => handler(request));
        } catch (error) {
          console.error(error);
        }
      }
    }

    this.add('GET', '/', [serve(staticDir)]);
    this.add('GET', '/', [security(securityOptions)]);
  }

  async setup() {
    // TODO
  }

  add(method, path, fns) {
    const func = fns.pop();
    const handler = fns.length === 0 ? func : compose(...fns)(func);

    this.router.add(method.toUpperCase(), path, handler);

    const middleware = async (context, next) => {
      const method = context.request.method;
      const { pathname, query } = parse(context.request.url, true); // TODO Test perf vs RegEx

      const [handler, dynamicRoutes] = this.router.find(method, pathname);

      const params = {};
      for (let r of dynamicRoutes) {
        params[r.name] = r.value;
      }

      if (handler !== undefined) {
        await handleRequest(context);
        context.params = { ...context.params, ...query, ...params };
        return await handler(context);
      } else {
        return await next();
      }
    };

    this.middlewareList.push(middleware);

    return this;
  }

  start({ routes = {}, port = 5544, fn = () => {} }) {
    for (let [method, route] of Object.entries(routes)) {
      for (let [path, handler] of Object.entries(route)) {
        this.add(method, path, Array.isArray(handler) ? handler : [handler]);
      }
    }

    // append 404 handler: it must be put at the end and only once
    // TODO Move to `catch` for pattern matching ?
    this.middlewareList.push(({ response }, _next) => {
      response.statusCode = 404;
      response.end();
    });

    const server = http.createServer((request, response) => {
      const context = { params: {}, headers: {}, request, response };

      this.middlewareList
        .compose(context)
        .then(handle(context))
        .then(() => Logger.printRequestResponse(context))
        .catch(error => {
          response.statusCode = error.status = 500; // ugly, but needed for the `finally` section

          // TODO remove at runtime in `production`, keep only in `development`
          Logger.printRequestResponse(context);
          Logger.printError(error, 'HTTP');

          const youch = new Youch(error, request);

          youch.toHTML().then(html => {
            response.writeHead(500, { 'Content-Type': 'text/html' }).end(html);
          });
        });
    }).on('error', error => {
      Logger.printError(error);
      process.exit(1);
    });

    return server.listen(port, fn);
  }
}

const handle = context => result => {
  if (null === result || undefined === result)
    throw new Error('No Return Statement in The Handler');

  let { response } = context;

  let body, headers, type, encoding;

  if (typeof result === 'string' || result instanceof Stream) {
    body = result;
  } else {
    body = result.body;
    headers = result.headers;
    type = result.type;
    encoding = result.encoding;
  }

  response.statusCode = result.statusCode || 200;

  for (var key in headers) {
    response.setHeader(key, headers[key]);
  }

  if (encoding) response.setHeader('Content-Encoding', encoding);

  if (Buffer.isBuffer(body)) {
    response.setHeader('Content-Type', type || 'application/octet-stream');
    response.setHeader('Content-Length', body.length);
    response.end(body);
    return;
  }

  if (body instanceof Stream) {
    if (!response.getHeader('Content-Type'))
      response.setHeader('Content-Type', type || 'text/html');

    body.pipe(response);
    return;
  }

  let str = body;

  if (typeof body === 'object' || typeof body === 'number') {
    str = JSON.stringify(body);
    response.setHeader('Content-Type', 'application/json');
  } else {
    if (!response.getHeader('Content-Type'))
      response.setHeader('Content-Type', type || 'text/plain');
  }

  response.setHeader('Content-Length', Buffer.byteLength(str));
  response.end(str);
};

const handleRequest = async context => {
  const buffer = await streamToString(context.request);

  if (buffer.length > 0) {
    const headers = context.request.headers;
    const contentType = headers['content-type'].split(';')[0];

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        Object.assign(context.params, querystring.parse(buffer));
        break;
      case 'application/json':
        const result = JSON.parse(buffer);
        if (isObject(result)) {
          Object.assign(context.params, result);
        }
        break;
      case 'multipart/form-data':
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
                mimetype
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
      default:
    }
  }
};

const streamToString = async stream => {
  let chunks = '';

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => (chunks += chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
};

module.exports = Huncwot;
