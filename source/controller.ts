// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import fg from 'fast-glob';
import { sep, parse } from 'path';

export const build = () => {
  const handlers = fg.sync(['features/**/Controller/**/*.(js|ts)']);

  return handlers.map(path => {
    const pattern = /([\.\w]+)\/Controller\/([\w\/]+).(js|ts)/;
    const [_, resource, operation] = pattern.exec(path);

    const { dir } = parse(path);

    if (operation.includes(sep)) {
      const segments = operation.split(sep);
      const action = segments.pop();

      return {
        resource: [resource, ...segments].join('/'),
        operation: action,
        dir
      };
    } else {
      return { resource, operation, dir };
    }
  });
};

export const translate = (name, resource, prefix = "/_api") =>
  ({
    browse: { method: 'get', route: `${prefix}/${resource}` },
    fetch: { method: 'get', route: `${prefix}/${resource}/:id` },
    create: { method: 'post', route: `${prefix}/${resource}` },
    update: { method: 'put', route: `${prefix}/${resource}/:id` },
    destroy: { method: 'delete', route: `${prefix}/${resource}/:id` }
  }[name]);
