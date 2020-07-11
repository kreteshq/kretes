// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('ks:routing'); // eslint-disable-line no-unused-vars

import { Route as TRoute, Handler } from '.';

// FIXME autogenerate somehow those function
const Route = {
  GET(path: string, handler: Handler, middleware: Function[] = []): TRoute {
    return [path, { GET: handler, middleware }]
  },
  POST(path: string, handler: Handler, middleware: Function[] = []): TRoute {
    return [path, { POST: handler, middleware }]
  },
  PATCH(path: string, handler: Handler, middleware: Function[] = []): TRoute {
    return [path, { PATCH: handler, middleware }]
  },
  PUT(path: string, handler: Handler, middleware: Function[] = []): TRoute {
    return [path, { PUT: handler, middleware }]
  },
  DELETE(path: string, handler: Handler, middleware: Function[] = []): TRoute {
    return [path, { DELETE: handler, middleware }]
  }
};

class Router {
  constructor() {}

  get() {}
}

export {
  Route
}

