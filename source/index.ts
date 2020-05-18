// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('kretes:index'); // eslint-disable-line no-unused-vars

const { join } = require('path');
import Router from 'trek-router';
import Stream from 'stream';
import http from 'http';
import httpstatus from 'http-status';
import pg from 'pg';
import { AddressInfo } from 'net';

import * as Middleware from './middleware';
import { Response } from './response';
import { App } from './manifest';
import { glob } from './filesystem';
const { build, translate } = require('./controller');
const { readAll } = require('./filesystem');
const { precompile } = require('./view');
const { NotFound } = require('./response');
const Logger = require('./logger');
const HTMLifiedError = require('./error');
const { compose } = require('./util');

const cwd = process.cwd();
const handlerDir = join(cwd, 'dist');

export interface Request {
  params: {
    [name: string]: any
  },
  files: {
    [name: string]: {
      name: string
      length: number
      data: any
      encoding: string
      mimetype: string
    }
  }
}

export type Handler = (request: Request) => Response | Promise<Response>;

export interface Resource {
  feature: string
  alias?: string
  children?: Resource[]
}

export interface Routes {
  DELETE?: {
    [name: string]: Handler
  },
  GET?: {
    [name: string]: Handler
  },
  HEAD?: {
    [name: string]: Handler
  },
  OPTIONS?: {
    [name: string]: Handler
  }
  PATCH?: {
    [name: string]: Handler
  },
  POST?: {
    [name: string]: Handler
  },
  PUT?: {
    [name: string]: Handler
  },
  Resources?: Resource[]
}

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

const lookupViews = async () => {
  const path = join(cwd, 'features/**/*.html');
  const files = await glob(path);
  return readAll(files, { cache: true });
};

export default class Kretes {
  server: http.Server;
  router: Router;
  middlewares: Middleware.Base;
  staticDir: string;

  constructor({
    staticDir = join(cwd, 'public'),
    graphql = false,
    implicitControllers = true,
    WebRPC = true,
    _verbose = false,
  } = {}) {
    this.server = null;
    this.middlewares = new Middleware.Base();
    this.router = new Router();
    this.staticDir = staticDir;

    if (graphql) {
      try {
        const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
        const { graphql, graphiql, makeSchema } = require('./graphql');

        const schema = makeSchema({ typeDefs, resolvers });

        // this.post('/graphql', graphql({ schema }));
        // this.get('/graphql', graphql({ schema }));
        // this.get('/graphiql', graphiql({ endpointURL: 'graphql' }));
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

    this.use(Middleware.Extractor());
  }

  async setup() {
    const config = require('config');
    const connection = config.get('db');
    App.DatabasePool = new pg.Pool(connection);
    App.DatabasePool.connect(error => {
      if (error) {
        Logger.printError(error, 'Data Layer');

        process.exit(1);
      }
    });

    if (process.env.NODE_ENV === 'production') {
      const views = await lookupViews();
      const parts = join(cwd, 'views/parts');
      precompile(views, { paths: [parts] })
    }
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

    this.use(Middleware.Rewriting());
    this.use(Middleware.Resolving());
    this.use(Middleware.Transforming());
    this.use(Middleware.HotReloading());
    this.use(Middleware.SPA());

    this.use(Middleware.Security());
    this.use(Middleware.CORS());
    this.use(Middleware.Routing(this.router));
    this.use(Middleware.Caching());
    this.use(Middleware.Serve(this.staticDir));

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

    return new Promise<http.Server>((resolve, reject) => {
      this.server.listen(port, () => {
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
    const { port } = this.server.address() as AddressInfo;
    return port;
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

// Kretes Modules
// TODO https://github.com/microsoft/TypeScript/issues/33079

// import {
//   auth,
//   background,
//   db,
//   request,
//   response,
//   view,
// } from 'kretes';

export * as auth from './auth';
export * as background from './background';
export * as request from './request';
export * as response from './response';
export * as view from './view';

import database from './db';
export { database };


