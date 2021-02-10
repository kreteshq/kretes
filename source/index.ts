// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from "debug";
const debug = Debug("ks:index"); // eslint-disable-line no-unused-vars

import { join } from "path";
import httpstatus from "http-status";

import * as Endpoint from "./endpoint";
import * as Middleware from "./middleware";
import { glob } from "./filesystem";
import { readAll } from "./filesystem";
import { precompile } from "./view";
import { NotFound } from "./response";
import Logger from "./logger";
import HTMLifiedError from "./error";
import { notice, print } from "./util";

import { setupControllersFromFilesystem } from "./core";

const cwd = process.cwd();

import { Handler, Routes, ServerApp } from "retes";

export interface Resource {
  feature: string;
  alias?: string;
  children?: Resource[];
}

export interface Meta {
  summary?: string;
  description?: string;
  parameters?: Array<any>;
  responses?: Object;
}

export interface Payload {
  [key: string]: any;
}

export type Task = (input: Payload) => Promise<void>;
export type Queue = any;

export interface ScheduleInput {
  task: Task;
  payload?: Payload;
  queue?: Queue;
  runAt?: Date;
  maxAttempts?: number;
}

// export interface Routes {
//   // FIXME [plug1, plug2, ..., plugk, handler] what's the type?
//   [name: string]: Handler | any[]
// }

const lookupViews = async () => {
  const path = join(cwd, "site/**/*.html");
  const files = await glob(path);
  return readAll(files, { cache: true });
};

const handleError = (context) =>
  (error) => {
    const { request, response } = context;

    response.statusCode = 500;
    error.status = `500 ${httpstatus[500]}`;

    // TODO remove at runtime in `production`, keep only in `development`
    Logger.printRequestResponse(context);
    Logger.printError(error, "HTTP");

    const htmlifiedError = new HTMLifiedError(error, request);

    htmlifiedError.generate().then((html) => {
      response.writeHead(500, { "Content-Type": "text/html" }).end(html);
    });
  };

const append = context => () => Logger.printRequestResponse(context);

export default class Kretes extends ServerApp {
  staticDir: string;
  routePaths: Object;
  isDatabase: boolean;
  snowpack: SnowpackDevServer | undefined;

  constructor({
    staticDir = join(cwd, "public"),
    graphql = false,
    implicitControllers = true,
    WebRPC = true,
    isDatabase = true,
    _verbose = false,
    routes = [] as Routes,
    snowpack = null
  } = {}) {
    super(routes, handleError, append);

    this.staticDir = staticDir;
    this.isDatabase = isDatabase;
    this.snowpack = snowpack;
  }

  async setup() {
    if (this.isDatabase) {
      try {
        this.add("POST", "/_api", await Endpoint.GraphQL());
        this.add("GET", "/_graphiql", await Endpoint.GraphiQL());
      } catch (error) {
        print(notice("Database Error"));
        print(notice("Error")(error));
        print(notice("Explain")(error));
      }
    }

    this.add("GET", "/_api.json", () => Endpoint.OpenAPI(this.routePaths));
    this.add("GET", "/_api", () => Endpoint.RedocApp());

    // FIXME Doesn't work
    // App.DatabasePool.on('error', error => {
    //   console.log("boo")
    // })

    if (process.env.NODE_ENV === "production") {
      const views = await lookupViews();
      const parts = join(cwd, "views/parts");
      precompile(views, { paths: [parts] });
    }

    setupControllersFromFilesystem(this);

    this.use(Middleware.Security());
    this.use(Middleware.CORS());
    this.use(Middleware.Routing(this.router));
    this.use(Middleware.Caching());
    this.use(Middleware.Serve(this.staticDir));
    this.use(Middleware.Extractor());

    if (process.env.NODE_ENV != "production") {

      // middlewares to run ONLY in Development
      this.use(Middleware.Snowpack(this.snowpack))
    }

    // append 404 middleware handler: it must be put at the end and only once
    // TODO Move to `catch` for pattern matching ?
    this.use(() => NotFound());
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

export * as auth from "./auth";
export * as background from "./background";
export * as request from "./request";
export * as response from "./response";
export * as view from "./view";
export * as routing from "./routing";
// export * as webrpc from './webrpc';
// export * as http from './http';

import database from "./db";
export { database };

import Schema from "validate";
import { SnowpackDevServer } from "snowpack";
export { Schema };

export { Handler, Routes };
