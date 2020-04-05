// Copyright 2020 Zaiste & contributors. All rights reserved.
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
const httpstatus = require('http-status');

const { cors, security, serve } = require('./middleware');
const { build, translate } = require('./controller');
const { NotFound } = require('./response');
const Logger = require('./logger');
const HTMLifiedError = require('./error');

const cwd = process.cwd();
const handlerDir = join(cwd, 'dist');

const isObject = _ => !!_ && _.constructor === Object;
const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

const lookupHandler = ({ feature, action }) => {
  const path = join(cwd, 'dist', 'features', feature, 'Controller', `${action}.js`);

  try {
    return require(path);
  } catch (error) {
    console.error(`'features/${feature}/Controller/${action}.js' could not be loaded.`);

    // return a handler that just informs about the missing handler
    return _ => `You need to create 'features/${feature}/Controller/${action}.js'`;
  }
};

class Middleware extends Array {
  async next(context, last, current, done, called, func) {
    if ((done = current > this.length)) return;

    func = this[current] || last;

    return (
      func &&
      func(context, async () => {
        if (called) throw new Error('next() already called');
        called = true;
        return this.next(context, last, current + 1);
      })
    );
  }

  async compose(context, last) {
    return this.next(context, last, 0);
  }
}

class Huncwot {
  constructor({
    staticDir = join(cwd, 'public'),
    graphql = false,
    implicitControllers = true,
    WebRPC = true,
    _verbose = false
  } = {}) {
    this.server = null;
    this.middlewares = new Middleware();
    this.router = new Router();
    this.staticDir = staticDir;

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

    if (implicitControllers) {
      const handlers = build();
      for (let { resource, operation, dir } of handlers) {
        try {
          const handler = require(`${join(handlerDir, dir, operation)}.js`);
          let { method, route } = translate(operation, resource.toLowerCase());

          route = route.replace('_', ':');

          if (Array.isArray(handler)) {
            this.add(method, route, ...handler);
          } else {
            this.add(method, route, handler);
          }

          if (WebRPC)
            this.add(
              'POST',
              `/rpc/${resource}/${operation}`,
              ...(Array.isArray(handler) ? handler : [handler])
            );
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  async setup() {
    // TODO
  }

  use(middleware) {
    if (typeof middleware !== 'function') throw new TypeError('middleware must be a function!');
    this.middlewares.push(middleware);

    return this;
  }

  add(method, path, ...fns) {
    const action = fns.pop();

    // pipeline is a handler composed over middlewares,
    // `action` function must be explicitly extracted from the pipeline
    // as it has different signature, thus cannot be composed
    const pipeline = fns.length === 0 ? action : compose(...fns)(action);

    this.router.add(method.toUpperCase(), path, pipeline);

    return this;
  }

  buildResourceDependencies(resources, parent = null) {
    for (let { feature, alias, children } of resources) {
      const path = `${(alias || feature).toLowerCase()}`;
      const scopedPath = parent ? `${parent}/:id/${path}` : path;

      try {
        // add member routes
        this.add('GET', `/${path}/:id`, lookupHandler({ feature, action: 'fetch' }));
        this.add('PUT', `/${path}/:id`, lookupHandler({ feature, action: 'update' }));
        this.add('DELETE', `/${path}/:id`, lookupHandler({ feature, action: 'destroy' }));

        // add collection routes (potentially scoped)
        this.add('GET', `/${scopedPath}`, lookupHandler({ feature, action: 'browse' }));
        this.add('POST', `/${scopedPath}`, lookupHandler({ feature, action: 'create' }));

        if (children) {
          // recursively go in with `parent` set
          this.buildResourceDependencies(children, (alias || feature).toLowerCase());
        }
      } catch (error) {
        console.error(`There is no feature ${feature} -> ${error.message}`);
      }

      // recursion goes up here
    }
  }

  async start({ routes = {}, port = 0 } = {}) {
    for (let [method, route] of Object.entries(routes)) {
      if (method !== 'Resources') {
        for (let [path, handler] of Object.entries(route)) {
          if (Array.isArray(handler)) {
            this.add(method, path, ...handler);
          } else {
            this.add(method, path, handler);
          }
        }
      } else {
        const resources = route;
        this.buildResourceDependencies(resources);
      }
    }

    const RouterMiddleware = async (context, next) => {
      const method = context.request.method;
      const { pathname, query } = parse(context.request.url, true); // TODO Test perf vs RegEx

      const [handler, dynamicRoutes] = this.router.find(method, pathname);

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

    this.use(security())
    this.use(cors());
    this.use(RouterMiddleware);
    this.use(serve(this.staticDir));

    // append 404 middleware handler: it must be put at the end and only once
    // TODO Move to `catch` for pattern matching ?
    this.use(() => NotFound());

    this.server = http
      .createServer((request, response) => {
        const context = { params: {}, headers: {}, request, response };

        this.middlewares
          .compose(context)
          .then(handle(context))
          .then(() => Logger.printRequestResponse(context))
          .catch(error => {
            response.statusCode = 500;
            error.status = `500 ${httpstatus[500]}`;

            // TODO remove at runtime in `production`, keep only in `development`
            Logger.printRequestResponse(context);
            Logger.printError(error, 'HTTP');

            const htmlifiedError = new HTMLifiedError(error, request);

            htmlifiedError.generate().then(html => {
              response.writeHead(500, { 'Content-Type': 'text/html' }).end(html);
            });
          });
      })
      .on('error', error => {
        Logger.printError(error);
        process.exit(1);
      });

    return new Promise((resolve, reject) => {
      this.server.listen(port, (err) => {
        if (err) return reject(err);
        resolve(this.server);
      });
    })
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) return reject(err);
        resolve();
      })
    })
  }

  get port () {
    return this.server && this.server.address().port
  }
}

const handle = context => result => {
  if (null === result || undefined === result)
    throw new Error('No return statement in the handler');

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

  Object.assign(
    {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    headers
  );

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
      }
      default:
    }
  }
};

const toBuffer = async stream => {
  const chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const streamToString = async stream => {
  let chunks = '';

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => (chunks += chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
};

const parseCookies = (cookieHeader = '') => {
  const cookies = cookieHeader.split(/; */);
  const decode = decodeURIComponent;

  if (cookies[0] === '') return {};

  const result = {};
  for (let cookie of cookies) {
    const isKeyValue = cookie.includes('=');

    if (!isKeyValue) {
      result[cookie.trim()] = true;
      continue;
    }

    let [key, value] = cookie.split('=');

    key.trim();
    value.trim();

    if ('"' === value[0]) value = value.slice(1, -1);

    try {
      value = decode(value);
    } catch (error) {
      // neglect
    }

    result[key] = value;
  }

  return result;
};

const parseAcceptHeader = ({ accept = '*/*' }) => {
  const preferredType = accept.split(',').shift();
  const format = preferredType.split('/').pop();

  return format;
};

module.exports = Huncwot;
