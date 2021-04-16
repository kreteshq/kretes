// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:middleware:serve'); // eslint-disable-line no-unused-vars

import { promises as fs, createReadStream } from 'fs';

import path from 'path';
import assert from 'assert';
import mime from 'mime-types';
import { parse } from 'url';
import { Middleware } from 'retes';

export const Serve = (root, opts = { index: 'index.html' }): Middleware => {
  assert(root, 'you need to specify `root` directory');
  debug('"%s" %j', root, opts);

  return next => async request => {
    const method = request.method;
    const { pathname } = parse(request.url, true); // TODO Test perf vs RegEx
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
          body: createReadStream(file),
          additional: {
            size: stats.size
          }
        };
      } catch (error) {
        // TODO distinguish between no file on disk and other error
        return next(request);
      }
    } else {
      return next(request);
    }
  };
};
