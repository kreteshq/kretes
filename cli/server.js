// Copyright 2019 Zaiste & contributors. All rights reserved.
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

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const cwd = process.cwd();

const { join, parse } = require('path');
const color = require('chalk');
const { TypescriptCompiler } = require('@poppinss/chokidar-ts');

const Huncwot = require('../');
const VERSION = require('../package.json').version;

let sockets = [];

const start = async ({ port }) => {
  //
  const app = new Huncwot();

  let routes = {};
  try {
    await app.setup();
    routes = require(join(cwd, 'dist/config/server/routes')).default;
  } catch (e) {
    console.error(e.message);
  }

  const server = app.start({ routes, port });

  server.on('connection', (socket) => {
    sockets.push(socket);
  });

  console.log(
    color`{bold.blue ┌ Huncwot} {bold ${VERSION}} {grey on} {bold localhost:${port}}\n{bold.blue └ }{grey Started: }${new Date().toLocaleTimeString()}`
  );

  return server;
};

const server = async ({ port }) => {
  const compiler = new TypescriptCompiler(
    cwd,
    'config/server/tsconfig.json',
    require('typescript/lib/typescript')
  );
  const { error, config } = compiler.configParser().parse();

  if (error || !config || config.errors.length) {
    return;
  }

  const watcher = compiler.watcher(config)

  let app;

  watcher.on('watcher:ready', async () => {
    // start the HTTP server

    app = await start({ port });
  });

  watcher.on('subsequent:build', ({ path: filePath }) => {
    console.clear();
    console.log(color`  {underline ${filePath}} {green reloaded}`);

    // restart the HTTP server
    sockets
      .filter(socket => !socket.destroyed)
      .forEach(socket => socket.destroy());

    sockets = [];

    app.close(async () => {
      app = await start({ port });
    });

    // clean the `require` cache
    const { dir, name } = parse(filePath);

    const cacheKey = `${join(cwd, 'dist', dir, name)}.js`;
    delete require.cache[cacheKey];
  });

  watcher.watch(['config/server', 'features'], {
    ignored: [
      'features/**/View/*',
      'features/**/Store.ts',
      'features/**/Store/*',
      'features/**/Model.ts',
      'features/**/Model/*'
    ]
  });
};

module.exports = {
  builder: _ =>
    _.option('port', { alias: 'p', default: 5544 }).default('dir', '.'),
  handler: server
};
