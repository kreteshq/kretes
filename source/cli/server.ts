// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import WebSocket from "ws";
import { App } from "../manifest";

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const CWD = process.cwd();

const { join, parse, sep, extname } = require('path');
const color = require('chalk');
const { TypescriptCompiler } = require('@poppinss/chokidar-ts');
const fs = require('fs-extra');
const transformPaths = require('@zerollup/ts-transform-paths');
const pg = require('pg');
const fg = require('fast-glob');
const postcss = require('postcss');

import Kretes from '../';
const VERSION = require('../../package.json').version;
const { parser } = require('../parser');
const { generateRPCOnClient } = require('../rpc');
const Logger = require('../logger');
// const SQLCompiler = require('../compiler/sql');
const { VueHandler } = require('../machine/watcher');

const reloadSQL = async (pool, file) => {
  const content = await fs.readFile(file);
  const isSQLFunction = content.toString().split(' ')[0].toLowerCase() === 'function';
  if (isSQLFunction) {
    const query = `create or replace ${content.toString()}`;
    try {
      const _r = await pool.query(query);
    } catch (error) {
      console.error(error.message);
    }
  }
};

let sockets = [];

const start = async ({ port }) => {
  //
  const app = new Kretes();

  let routes = {};
  try {
    await app.setup();
    routes = require(join(CWD, 'dist/config/server/routes')).default;
  } catch (e) {
    console.error(e.message);
  }

  const server = await app.start({ routes, port });

  server.on('connection', socket => {
    sockets.push(socket);
  });

  const wss = new WebSocket.Server({ server });
  wss.on('connection', socket => {
    App.WebSockets.add(socket)
    socket.send(JSON.stringify({ type: 'connected' }))
    socket.on('close', () => App.WebSockets.delete(socket))
  })

  wss.on('error', (error: Error & { code: string }) => {
    if (error.code !== 'EADDRINUSE') {
      console.error(`ws error:`)
      console.error(error)
    }
  })

  console.log(
    color`{bold.blue ┌ Kretes} {bold ${VERSION}} {grey on} {bold localhost:${port}}\n{bold.blue └ }{grey Started: }${new Date().toLocaleTimeString()}`
  );

  return server;
};

const handler = async ({ port, production }) => {
  process.env.KRETES = production ? 'production' : 'development';
  console.log(color`  {grey Starting... (it may take few seconds)}`);

  const compiler = new TypescriptCompiler(
    CWD,
    'config/server/tsconfig.json',
    require('typescript/lib/typescript')
  );
  const { error, config } = compiler.configParser().parse();

  if (error || !config || config.errors.length) {
    return;
  }

  compiler.use((ts, _config) => {
    const { options, fileNames } = config;
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram(fileNames, options, host);
    const r = transformPaths(program, config);
    return context => r.before(context);
  }, 'before');

  const watcher = compiler.watcher(config);

  let app;

  watcher.on('watcher:ready', async () => {
    // const stream = fg.stream([`${CWD}/features/**/*.sql`], { dot: true });
    // for await (const entry of stream) await reloadSQL(pool, entry);

    // start the HTTP server
    app = await start({ port });
  });

  // files other than `.ts` have changed
  watcher.on('change', async filePath => {
    console.clear();
    console.log(color`  {underline ${filePath}} {green reloaded}`);
    const extension = extname(filePath);

    const timestamp = Date.now();

    switch (extension) {
      case '.css':
        compileCSS();
        break;
      case '.sql':
        // reloadSQL(pool, filePath);
        // try {
        //   const output = await SQLCompiler.compile(join(CWD, filePath));
        //   const { dir } = parse(filePath);
        //   await fs.outputFile(join(CWD, dir, 'index.ts'), output);
        //   console.log(color`  {underline ${filePath}} {green reloaded}`);
        // } catch (error) {
        //   console.log(
        //     color`  {red.bold Errors:}\n  {grey in} {underline ${filePath}}\n   → ${error.message}`
        //   );
        // }
        break;
      case '.vue':
        VueHandler(filePath, timestamp);
        break;

      default:
        break;
    }
  });

  watcher.on('subsequent:build', async ({ path: filePath, diagnostics }) => {
    console.clear();
    console.log(color`  {underline ${filePath}} {green reloaded}`);
    diagnostics.forEach(({ file, messageText }) => {
      const location = file.fileName.split(`${CWD}${sep}`)[1];
      console.log(
        color`  {red.bold Errors:}\n  {grey in} {underline ${location}}\n   → ${
          messageText.messageText || messageText
        }`
      );
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
      const [_interface, methods] = Object.entries(results).shift();
      const entityName = _interface.split('ServiceInterface').shift();

      const generated = generateRPCOnClient({ name: entityName, methods });

      await fs.writeFile(join(CWD, 'features', entityName, 'Requester.ts'), generated);
    }
  });

  const output = watcher.watch(
    ['config', 'features', 'stylesheets'],
    { ignored: [] }
  );

  if (output.diagnostics.length > 0) console.log(color`  {red.bold Errors:}`);
  output.diagnostics.forEach(({ file, messageText }) => {
    const location = file.fileName.split(`${CWD}${sep}`)[1];
    console.log(
      color`  {grey in} {underline ${location}}\n   → ${messageText.messageText || messageText}`
    );
  });

  //compileCSS();
};

const compileCSS = async () => {
  const { transformers } = require(join(CWD, 'config', 'css.config'));

  try {
    const content = await fs.readFile(join(CWD, 'stylesheets', 'main.css'));
    const { css } = await postcss(transformers).process(content, {
      from: 'stylesheets/main.css',
      to: 'main.css',
      map: { inline: true },
    });

    fs.outputFile(join(CWD, 'public', 'main.css'), css);
  } catch (error) {
    if (error.name === 'CssSyntaxError') {
      console.error(`  ${error.message}\n${error.showSourceCode()}`);
    } else {
      throw error;
    }
  }
};

module.exports = {
  builder: _ => _
    .option('port', { alias: 'p', default: 5544 })
    .option('production', { type: 'boolean', default: false })
    .default('dir', '.'),
  handler,
};
