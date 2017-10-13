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

const { runHttpQuery } = require('apollo-server-core');
const { resolveGraphiQLString } = require('apollo-server-module-graphiql');
const { makeExecutableSchema } = require('graphql-tools');

const Huncwot = require('../');
const { page } = require('../view');
const { ok, html } = require('../response');

const cwd = process.cwd();

const VERSION = require('../package.json').version;

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

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
      let handlersPath = `${join(cwd, 'pages', pathname)}.handler.js`;
      handlers = require(handlersPath);
    } catch (error) {
      switch (error.code) {
        case 'MODULE_NOT_FOUND':
          break;
        default:
          console.error(error);
          exit();
      }
    }

    app.get(route, request => page(pathname, (handlers.get || get)(request)))

    for (let [ method, handler ] of Object.entries(handlers)) {
      if (HTTP_METHODS.includes(method)) {
        app[method](route, request => page(pathname, handler(request)))
      } else {
        console.info(`Handler file '${join('pages', pathname)}.handler.js' uses unsupported HTTP method name: ${method}`);
      }
    }
  }

  // API

  const resources = await list(join(cwd, 'controllers'), '.js');

  for (let { _, pathname } of resources) {
    let handlers = {};

    try {
      let handlersPath = `${join(cwd, 'controllers', pathname)}.js`;
      handlers = require(handlersPath);
    } catch (error) {
      console.error(error);
    }

    for (let [ name, handler ] of Object.entries(handlers)) {
      let { method, route } = translate(name, pathname)
      app[method](route, request => handler(request));
    }
  }

  // GraphQL

  const typeDefs = require(join(cwd, 'schema.js'))
  const resolvers = require(join(cwd, 'resolvers'));

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  app.post('/graphql', graphql({ schema }));
  app.get('/graphql', graphql({ schema }));
  app.get('/graphiql', graphiql({ endpointURL: 'graphql' }));
}

function graphql(options) {
  return async request => {
    let method = request.request.method;
    let query = request.params;
    let response = await runHttpQuery([], { method, options, query });

    return ok(response);
  }
}

function graphiql(options) {
  return async request => {
    let query = request.params;
    let response = await resolveGraphiQLString(query, options, request)

    return html(response);
  }
}

function translate(name, resource) {
  const methods = {
    browse: { method: 'get', route: `/${resource}` },
    read: { method: 'get', route: `/${resource}/:id` },
    edit: { method: 'put', route: `/${resource}/:id` },
    add: { method: 'post', route: `/${resource}` },
    destroy: { method: 'delete', route: `/${resource}/:id` },
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
