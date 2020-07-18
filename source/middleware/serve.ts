// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:middleware:serve'); // eslint-disable-line no-unused-vars

import { promises as fs } from 'fs-extra';

import path from 'path';
import assert from 'assert';
import mime from 'mime-types';
import { parse } from 'url';

export const Serve = (root, opts = { index: 'index.html' }) => {
  assert(root, 'you need to specify `root` directory');
  debug('"%s" %j', root, opts);

  return async (context, next) => {
    const method = context.request.method;
    const { pathname } = parse(context.request.url, true); // TODO Test perf vs RegEx
    debug('"%s" -> %s', method, pathname);

    if (method.toUpperCase() === 'HEAD' || method.toUpperCase() === 'GET') {
      try {
        let file = path.join(root, pathname);
        let stats = await fs.stat(file);

        if (stats.isDirectory()) {
          file = path.join(file, opts.index);
          stats = await fs.stat(file);
        }

        let type = path.extname(file);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': mime.lookup(type) || 'application/octet-stream'
          },
          body: fs.createReadStream(file),
          additional: {
            size: stats.size
          }
        };
      } catch (error) {
        return next(context);
      }
    } else {
      return next(context);
    }
  };
};
