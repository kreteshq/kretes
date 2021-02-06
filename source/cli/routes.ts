// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:cli:routes'); // eslint-disable-line no-unused-vars

import __ from 'chalk';
import { join } from 'path';

import { ResourceRoutes, build, translate } from '../controller';

export const handler = () => {
  console.log(__`Routes on the {underline server}\n`);
  
  const { default: r } = require(join(process.cwd(), 'dist', 'config', 'server', 'routes.js');
  for (const [path] of r) {
    // FIXME get the method name
    console.log(path)
  }

  console.log()

  for (const [resource, operations] of Object.entries(build())) {
    if (operations.includes("index")) {
      const routes = ResourceRoutes(resource)
      for (const {method, route} of Object.values(routes)) {
        console.log(__`{magenta ${method.padEnd(13, ' ')}} /${route}`);
      }
    } else {
      for (const operation of operations) {
        let { method, route } = translate(operation, resource.toLowerCase());
        console.log(__`{magenta ${method.toUpperCase().padEnd(13, ' ')}} ${route}`);
      }
    }


  }

  console.log(__`\nRoutes on the {underline client}`);
  let routes = [];

  for (let { path } of routes) {
    console.log(__`{magenta GET} ${path}`);
  }

};

export const builder = _ => _;
