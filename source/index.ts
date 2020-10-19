// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:index'); // eslint-disable-line no-unused-vars

import { join } from 'path';
import Router from 'trek-router';
import Stream from 'stream';
import http from 'http';
import httpstatus from 'http-status';
import pg from 'pg';
import { AddressInfo } from 'net';
import { startService } from 'esbuild';

import * as Middleware from './middleware';
import * as Endpoint from './endpoint';

import { RedocApp, Response } from './response';
import { App } from './manifest';
import { glob } from './filesystem';
import { build, translate } from './controller';
import { readAll } from './filesystem';
import { precompile } from './view';
import { NotFound, JSONPayload, HTMLString, OpenAPI } from './response';
import Logger from './logger';
import HTMLifiedError from './error';
import { compose } from './util';

const cwd = process.cwd();
const handlerDir = join(cwd, 'dist');

const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  DELETE: 'DELETE',
} as const;

export type HTTPMethod = (typeof HTTPMethod)[keyof typeof HTTPMethod];

export interface Request {
  params: {
    [name: string]: any
  },
  headers: {
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
  },
  url: string,
  method: string
  format: string
}

export type Handler = (request: Request) => Response | Promise<Response>;

export interface Resource {
  feature: string
  alias?: string
  children?: Resource[]
}

export interface Meta {
  summary?: string
  description?: string
  parameters?: Array<any>
  responses?: Object
}

interface RouteParams {
  GET?: Handler
  POST?: Handler
  PUT?: Handler
  PATCH?: Handler
  DELETE?: Handler
  middleware?: any
  meta?: Meta
}
export type Route = [string, RouteParams, Route?];
export type Routes = Route[];

export interface Payload {
  [key: string]: any
}

export type Task = (input: Payload) => Promise<void>;
export type Queue = any;

export interface ScheduleInput {
  task: Task
  payload?: Payload
  queue?: Queue
  runAt?: Date
  maxAttempts?: number
}


// export interface Routes {
//   // FIXME [plug1, plug2, ..., plugk, handler] what's the type?
//   [name: string]: Handler | any[]
// }


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
          const { [operation]: handler } = require(`${join(handlerDir, dir, operation)}.js`);

          // FIXME better description
          // it happens when the function name inside the handler file
          // is different than the file name
          if (undefined === handler) {
            throw new Error(`Handler name mismatch for ${operation}`)
          }

          let { method, route } = translate(operation, resource.toLowerCase());

          route = route.replace('_', ':');

          if (Array.isArray(handler)) {
            this.add(method, route, ...handler);
          } else {
            this.add(method, route, handler);
          }
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
    App.DatabasePool = new pg.Pool({ port: 5454, ...connection });

    App.DatabasePool.connect(error => {
      if (error) {
        Logger.printError(error, 'Data Layer');

        process.exit(1);
      }
    });

    // FIXME Doesn't work
    // App.DatabasePool.on('error', error => {
    //   console.log("boo")
    // })

    debug('starting ESBuild service');
    App.ESBuild = await startService();

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

  add(method: HTTPMethod, path, ...fns) {
    const action = fns.pop();

    // pipeline is a handler composed over middlewares,
    // `action` function must be explicitly extracted from the pipeline
    // as it has different signature, thus cannot be composed
    const pipeline = fns.length === 0 ? action : compose(...fns)(action);

    this.router.add(method.toUpperCase(), path, pipeline);

    return this;
  }

  async start(routes: Routes = [], port: number = 0) {
    const routePaths = {};

    for (const [path, params] of routes) {
      const { middleware = [], meta = {} } = params;
      const { summary = path } = meta;

      for (let [method, handler] of Object.entries(params)) {
        if (method in HTTPMethod) {
          routePaths[path] = {}
          routePaths[path][method.toLowerCase()] = {
            ...meta,
            summary,
          };

          const flow = middleware.concat(handler);
          this.add(method as HTTPMethod, path, ...flow);
        }
        // else: a key name undefined in the spec -> discarding
      }
    }

    const packageJSONPath = join(process.cwd(), 'package.json');
    const { title = "", description = "", version = ""} = require(packageJSONPath);

    this.add('GET', '/__rest.json', () => OpenAPI({ title, version, description }, routePaths));
    this.add('GET', '/__rest', () => RedocApp());
    this.add('POST', '/graphql', await Endpoint.GraphQL())

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

  if (body instanceof Function)
    throw new Error('You need to return a value not a function.')

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
//   database,
//   request,
//   response,
//   view,
// } from 'kretes';

export * as auth from './auth';
export * as background from './background';
export * as request from './request';
export * as response from './response';
export * as view from './view';
export * as routing from './routing';
// export * as webrpc from './webrpc';
// export * as http from './http';

import database from './db';
export { database };

import Schema from 'validate';
export { Schema };
