// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Handler, Pipeline, ServerApp } from 'retes';
import Path from 'path';

import { build, translate } from './controller';

const cwd = process.cwd();
const handlerDir = Path.join(cwd, '.compiled');

export class Kretes {
  constructor() {}
}

export const setupControllersFromFilesystem = (app: ServerApp) => {
  const controllers = build();
  for (const resource in controllers) {
    let controller = {};
    if (controllers[resource].includes('index')) {
      controller = require(`${Path.join(handlerDir, 'site', '_api', resource, 'index')}.js`);
    } else {
      for (let operation of controllers[resource]) {
        try {
          const { [operation]: handler } = require(`${Path.join(
            handlerDir,
            'site',
            '_api',
            resource,
            operation
          )}.js`);

          // FIXME better description
          // it happens when the function name inside the handler file
          // is different than the file name
          if (undefined === handler) {
            throw new Error(`Handler name mismatch for ${operation}`);
          }

          controller[operation] = handler;
        } catch (error) {
          console.error(error.message);
        }
      }
    }

    for (const [operation, handler] of Object.entries<Handler | Pipeline>(controller)) {
      let { method, route } = translate(operation, resource.toLowerCase());

      // TODO (later)
      //route = route.replace('_', ':');

      if (Array.isArray(handler)) {
        app.add(method, route, ...handler);
      } else {
        app.add(method, route, handler as Handler);
      }
    }
  }
};

import { lookpath } from 'lookpath';
export const checkIfNixInstalled = async () => await lookpath('nix-shell');
