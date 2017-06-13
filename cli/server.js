// Copyright 2016 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const debug = require('debug')('server');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const { join, resolve, extname, parse } = require('path');
const chokidar = require('chokidar');
const color = require('chalk');

const Huncwot = require('../');
const { page } = require('../view');

const cwd = process.cwd();

let concat = (a, b) => a.concat(b);

function scan(directory, recursive = true) {
  return fs
    .readdirAsync(directory)
    .map(el =>
      fs.statAsync(join(directory, el)).then(stat => {
        if (stat.isFile()) {
          return el;
        } else {
          return !recursive
            ? []
            : scan(join(directory, el))
                .reduce(concat, [])
                .map(_ => join(el, _));
        }
      })
    )
    .reduce(concat, []);
}

async function list(dir, ext) {
  return scan(dir)
    .filter(f => extname(f) === ext)
    .map(f => {
      const { dir, name } = parse(f);

      const pathname = join(dir, name);
      let route;

      if (name === 'index') {
        route = join('/', dir);
      } else {
        route = join('/', dir, name);
      }

      return { route, pathname };
    })
}

async function init(app) {
  const pages = await list('./pages', '.marko');

  for (let { route, pathname } of pages) {
    let get = () => ({})
    let handlers = {};

    try {
      let handlersPath = `${join(cwd, 'pages', pathname)}.js`; // XXX to avoid Marko autoload
      handlers = require(handlersPath);
    } catch (error) {}

    app.get(route, request => page(pathname, (handlers.get || get)(request)))

    for (let [ method, handler ] of Object.entries(handlers)) {
      app[method](route, request => page(pathname, handler(request)))
    }
  }

  // API

  const resources = await list(join(cwd, 'rest'), '.js');

  for (let { _, pathname } of resources) {
    let handlers = {};

    try {
      let handlersPath = `${join(cwd, 'rest', pathname)}.js`;
      handlers = require(handlersPath);
    } catch (error) {
      console.error(error);
    }


    for (let [ name, handler ] of Object.entries(handlers)) {
      let { method, route } = translate(name, pathname)
      app[method](route, request => handler(request));
    }
  }
}

function translate(name, resource) {
  const methods = {
    browse: { method: 'get', route: `/rest/${resource}` },
    read: { method: 'get', route: `/rest/${resource}/:id` },
    edit: { method: 'put', route: `/rest/${resource}/:id` },
    add: { method: 'post', route: `/rest/${resource}` },
    destroy: { method: 'delete', route: `/rest/${resource}/:id` },
  };

  return methods[name];
}

function serve({ port, dir }) {
  const watcher = chokidar.watch(dir, {
    ignored: /[\/\\]\./,
    cwd: '.'
  });

  watcher.on('change', () => {})

  let server = join(cwd, 'server.js');

  try {
    require(server);
  } catch (_) {
    const app = new Huncwot();
    init(app);
    app.listen(port)
  }

  console.log(`${color.bold.green('Huncwot:')} Server running at ${color.underline.blue(`http://localhost:${port}`)}`);
}

module.exports = {
  builder: _ => _
    .option('port', { alias: 'p', default: 5544 })
    .default('dir', '.'),
  handler: serve
};
