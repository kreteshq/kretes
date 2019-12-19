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
const CWD = process.cwd();

const { join, parse, sep } = require('path');
const color = require('chalk');
const { TypescriptCompiler } = require('@poppinss/chokidar-ts');
const fs = require('fs-extra');

const Huncwot = require('../');
const VERSION = require('../package.json').version;
const { parser } = require('../parser');
const { generateRPCOnClient } = require('../rpc');

let sockets = [];

const start = async ({ port }) => {
  //
  const app = new Huncwot();

  let routes = {};
  try {
    await app.setup();
    routes = require(join(CWD, 'dist/config/server/routes')).default;
  } catch (e) {
    console.error(e.message);
  }

  const server = app.start({ routes, port });

  server.on('connection', socket => {
    sockets.push(socket);
  });

  console.log(
    color`{bold.blue ┌ Huncwot} {bold ${VERSION}} {grey on} {bold localhost:${port}}\n{bold.blue └ }{grey Started: }${new Date().toLocaleTimeString()}`
  );

  return server;
};

const server = async ({ port }) => {
  const compiler = new TypescriptCompiler(CWD, 'config/server/tsconfig.json', require('typescript/lib/typescript'));
  const { error, config } = compiler.configParser().parse();

  if (error || !config || config.errors.length) {
    return;
  }

  const watcher = compiler.watcher(config);

  let app;

  watcher.on('watcher:ready', async () => {
    // start the HTTP server

    app = await start({ port });
  });

  watcher.on('subsequent:build', async ({ path: filePath, diagnostics }) => {
    console.clear();
    console.log(color`  {underline ${filePath}} {green reloaded}`);
    diagnostics.forEach(({ file, messageText }) => {
      const location = file.fileName.split(`${CWD}${sep}`)[1];
      console.log(color`  {red.bold Errors:}\n  {grey in} {underline ${location}}\n   → ${messageText}`);
    });

    // restart the HTTP server
    sockets.filter(socket => !socket.destroyed).forEach(socket => socket.destroy());

    sockets = [];

    app.close(async () => {
      app = await start({ port });
    });

    // clean the `require` cache
    const { dir, name } = parse(filePath);

    const cacheKey = `${join(CWD, 'dist', dir, name)}.js`;
    delete require.cache[cacheKey];

    if (dir.includes('Service') && name == 'Interface') {
      const interfaceFile = await fs.readFile(`${join(CWD, dir, name)}.ts`);
      const results = parser(interfaceFile.toString());
      const [interface, methods] = Object.entries(results).shift();
      const entityName = interface.split('ServiceInterface').shift();

      const generated = generateRPCOnClient({ name: entityName, methods });

      await fs.writeFile(join(CWD, 'features', entityName, 'Requester.ts'), generated);
    }
  });

  const output = watcher.watch(['config/server', 'features'], {
    ignored: [
      'features/**/View/*',
      'features/**/Store.ts',
      'features/**/Store/*',
      'features/**/Model.ts',
      'features/**/Model/*'
    ]
  });

  if (output.diagnostics.length > 0) console.log(color`  {red.bold Errors:}`);
  output.diagnostics.forEach(({ file, messageText }) => {
    const location = file.fileName.split(`${CWD}${sep}`)[1];
    console.log(color`  {grey in} {underline ${location}}\n   → ${messageText}`);
  });
};

module.exports = {
  builder: _ => _.option('port', { alias: 'p', default: 5544 }).default('dir', '.'),
  handler: server
};
