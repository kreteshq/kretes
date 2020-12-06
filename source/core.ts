// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { build, translate } from './controller';
import Path from 'path';

const cwd = process.cwd();
const handlerDir = Path.join(cwd, 'dist');

export class Kretes {
  constructor() {}
}

export const setupControllersFromFilesystem = (app) => {
  const handlers = build();
  for (let { resource, operation, dir } of handlers) {
    try {
      const { [operation]: handler } = require(`${Path.join(handlerDir, dir, operation)}.js`);

      // FIXME better description
      // it happens when the function name inside the handler file
      // is different than the file name
      if (undefined === handler) {
        throw new Error(`Handler name mismatch for ${operation}`)
      }

      let { method, route } = translate(operation, resource.toLowerCase());

      route = route.replace('_', ':');

      if (Array.isArray(handler)) {
        app.add(method, route, ...handler);
      } else {
        app.add(method, route, handler);
      }
    } catch (error) {
      console.error(error);
    }
  }

}

import { lookpath } from 'lookpath';
export const checkIfNixInstalled = async () => await lookpath('nix-shell');
