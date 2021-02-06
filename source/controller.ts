// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import fg from 'fast-glob';
import { sep, parse } from 'path';
import { HTTPMethod } from 'retes';

interface Controller {
  [name: string]: string[]
}

type BuildController = () => Controller;

export const build: BuildController = () => {
  const pattern = /site\/_api\/([\.\w]+)\/([\w\/]+).(js|ts)/;
  const handlers = fg.sync(['site/_api/**/*.(js|ts)']);

  const controllers = {}
  for (const path of handlers) {
    const { dir } = parse(path);
    let [_, resource, operation] = pattern.exec(path);

    // FIXME probably not needed as I want to
    // keep the controllers flat under `_api`
    if (operation.includes(sep)) {
      const segments = operation.split(sep);
      const action = segments.pop();

      resource = [resource, ...segments].join('/');
      operation = action;
    } 

    controllers[resource] = (controllers[resource] || []).concat(operation);
  }

  return controllers;
};

interface RouteMethod {
  method: HTTPMethod
  route: string
}

type TranslateRouteMethod = (name: string, resource: string, prefix?: string) => RouteMethod

export const ResourceRoutes = (resource, prefix = "_api") => ({
  browse: { method: 'GET' as HTTPMethod, route: `${prefix}/${resource}` },
  fetch: { method: 'GET' as HTTPMethod, route: `${prefix}/${resource}/:id` },
  create: { method: 'POST' as HTTPMethod, route: `${prefix}/${resource}` },
  update: { method: 'PUT' as HTTPMethod, route: `${prefix}/${resource}/:id` },
  destroy: { method: 'DELETE' as HTTPMethod, route: `${prefix}/${resource}/:id` }
})

export const translate: TranslateRouteMethod = (name, resource, prefix = "/_api") =>
  ResourceRoutes[name];
