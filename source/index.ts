// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:index'); // eslint-disable-line no-unused-vars

import { join } from 'path';
import http from 'http';
import httpstatus from 'http-status';
import pg from 'pg';
import { startService } from 'esbuild';

import * as Middleware from './middleware';
import * as Endpoint from './endpoint';

import { App } from './manifest';
import { glob } from './filesystem';
import { build, translate } from './controller';
import { readAll } from './filesystem';
import { precompile } from './view';
import { NotFound } from './response';
import Logger from './logger';
import HTMLifiedError from './error';

const cwd = process.cwd();
const handlerDir = join(cwd, 'dist');

import { Routes, HTTPMethod, Handler, ServerApp, handle } from 'retes';

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

export default class Kretes extends ServerApp {
  staticDir: string;
  routePaths: Object

  constructor({
    staticDir = join(cwd, 'public'),
    graphql = false,
    implicitControllers = true,
    WebRPC = true,
    _verbose = false,
    routes = [] as Routes
  } = {}) {
    super(routes);

    this.staticDir = staticDir;

    // if (graphql) {
    //   try {
    //     const { graphql, graphiql, makeSchema } = require('./graphql');

    //     const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
    //     const schema = makeSchema({ typeDefs, resolvers });

    //     // this.post('/graphql', graphql({ schema }));
    //     // this.get('/graphql', graphql({ schema }));
    //     // this.get('/graphiql', graphiql({ endpointURL: 'graphql' }));
    //   } catch (error) {
    //     switch (error.code) {
    //       case 'MODULE_NOT_FOUND':
    //         console.log('GraphQL is not set up.');
    //         break;
    //       default:
    //         console.error(error);
    //         break;
    //     }
    //   }
    // }

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
    if (!App.ESBuild) {
      App.ESBuild = await startService();
    }

    if (process.env.NODE_ENV === 'production') {
      const views = await lookupViews();
      const parts = join(cwd, 'views/parts');
      precompile(views, { paths: [parts] })
    }

    if (true) {
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

  }

  async start(port: number = 0) {
    this.use(Middleware.Security());
    this.use(Middleware.CORS());
    this.use(Middleware.Routing(this.router));
    this.use(Middleware.Caching());
    this.use(Middleware.Serve(this.staticDir));
    this.use(Middleware.Extractor());

    if (process.env.NODE_ENV != 'production') {
      // middlewares to run ONLY in Development
      this.use(Middleware.Rewriting());
      this.use(Middleware.Resolving());
      this.use(Middleware.Transforming());
      this.use(Middleware.TransformingTypeScript());
      this.use(Middleware.HotReloading());
      this.use(Middleware.SPA());
    }

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
}

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

export { Handler, Routes }
