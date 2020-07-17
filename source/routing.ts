// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('ks:routing'); // eslint-disable-line no-unused-vars

const { join } = require('path');

import { Route as TRoute, Handler } from '.';

const cwd = process.cwd();

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
  },
  Resource(feature: string, options?) {
    return buildResource([{ feature, ...options }]);
  }
};

const lookupHandler = ({ feature, action }) => {
  const path = join(cwd, 'dist', 'features', feature, 'Controller', `${action}.js`);

  try {
    const { [action]: handler } = require(path);
    return handler;
  } catch (error) {
    console.error(`'features/${feature}/Controller/${action}.js' could not be loaded.`);

    // return a handler that just informs about the missing handler
    return _ => `You need to create 'features/${feature}/Controller/${action}.js'`;
  }
};

const { GET, PUT, DELETE, POST } = Route;

// pretty smart, huh? :)
function * buildResource(resources, parent: string = null) {
  const routes = [];

  for (const { feature, alias, children } of resources) {
    const path = `${(alias || feature).toLowerCase()}`;
    const scopedPath = parent ? `${parent}/:id/${path}` : path;

    try {
      // add member routes
      yield GET(`/${path}/:id`, lookupHandler({ feature, action: 'fetch' }));
      yield PUT(`/${path}/:id`, lookupHandler({ feature, action: 'update' }));
      yield DELETE(`/${path}/:id`, lookupHandler({ feature, action: 'destroy' }));

      // add collection routes (potentially scoped)
      yield GET(`/${scopedPath}`, lookupHandler({ feature, action: 'browse' }));
      yield POST(`/${scopedPath}`, lookupHandler({ feature, action: 'create' }));

      if (children) {
        // recursively go in with `parent` set
        for (const route of buildResource(children, path)) {
          yield route;
        }
      }
    } catch (error) {
      console.error(`There is no feature ${feature} -> ${error.message}`);
    }

    // recursion goes up here
  }

  return routes;
}
class Router {
  constructor() {}

  get() {}
}

export {
  Route
}

