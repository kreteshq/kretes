// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:start'); // eslint-disable-line no-unused-vars

import { join, parse, sep, extname } from 'path';
import color from 'chalk';
import { TypescriptCompiler } from '@poppinss/chokidar-ts';
import fs from 'fs-extra';
import postcss from 'postcss';
import { Response } from 'retes';
import { DiagnosticMessageChain } from 'typescript';
import transformPaths from '@zerollup/ts-transform-paths';
import { LspWatcher } from '@poppinss/chokidar-ts/build/src/LspWatcher';
import { PluginFn } from '@poppinss/chokidar-ts/build/src/Contracts';
import * as _ from 'colorette';
import pg from "pg";

import Kretes from '../';
import { parser } from '../parser';
// const SQLCompiler = require('../compiler/sql');
import { notice, print } from '../util';
import { generateWebRPCOnClient, RemoteMethodList } from '../rpc';
import { App } from '../manifest'
import { start } from './run';

const CWD = process.cwd();
const VERSION = require('../../package.json').version;
const { JSONPayload } = Response;

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

let stdout;

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

const startSnowpack = async () => {
  // FIXME Error https://github.com/snowpackjs/snowpack/discussions/2267
  const { createConfiguration, startServer } = require('snowpack');
  const config = createConfiguration({
    root: process.cwd(),
    alias: {
      '@/components': './components',
      '@/types': './types',
    },
    mount: {
      components: '/@/components/',
      site: '/',
      public: { url: '/', static: true, resolve: false },
    },
    packageOptions: {
      external: ['kretes'],
    },
    exclude: ['**/site/_api/**/*', '**/controllers/**/*'],
    devOptions: {
      hmr: true,
      port: 3333,
      open: 'none',
      output: 'stream',
    },
  });
  const snowpack = await startServer({ config, lockfile: null });

  return snowpack;
};

const isDatabaseConfigured = () => {
  const config = require(join(CWD, 'config', 'default.json'));
  const { PGHOST, PGPORT, PGDATABASE, PGDATA } = process.env;
  return 'db' in config || (PGHOST && PGPORT && PGDATABASE && PGDATA);
};

const handler = async ({ port, production, database }) => {
  print(notice('Kretes'));
  process.env.KRETES = production ? 'production' : 'development';

  let app: Kretes;


  if (isDatabaseConfigured()) {
    const config = require("config");
    const connection = config.has("db") ? config.get("db") : {}; // node-pg supports env variables

    App.DatabasePool = new pg.Pool(connection);
    await App.DatabasePool.connect();
    App.Database = true;
    print(notice("Database OK"));
  }

  if (production) {
    await fs.ensureDir('dist/tasks');

    app = await start({ port, database });
  } else {
    const TS = require('typescript/lib/typescript');
    const compiler = new TypescriptCompiler(
      CWD,
      'config/server/tsconfig.json',
      TS
    );
    const { error, config } = compiler.configParser().parse();

    if (error || !config || config.errors.length) {
      console.error(error.messageText);
      return;
    }

    const snowpack = await startSnowpack();
    print(notice("Snowpack"))

    // transforms `paths` defined in tsconfig.json
    // for the server-side code
    //@ts-ignore
    const plugin: PluginFn = (ts, _config) => {
      const { options, fileNames } = config;
      const host = ts.createCompilerHost(options);
      const program = ts.createProgram(fileNames, options, host);
      const r = transformPaths(program);
      return context => r.before(context);
    };

    compiler.use(plugin, 'before');

    let restartInProgress = false;

    const watcher = compiler.watcher(config, 'lsp') as LspWatcher;
    watcher.on('watcher:ready', async () => {
      // const stream = fg.stream([`${CWD}/features/**/*.sql`], { dot: true });
      // for await (const entry of stream) await reloadSQL(pool, entry);

      await fs.ensureDir('dist/tasks');

      // start the HTTP server
      app = await start({ port, database, snowpack });

      await compileCSS();
      print(notice('CSS'));

      print(notice('Listening')(port));
      print(notice('Logs'));
    });

    // files other than `.ts` have changed
    watcher.on('change', async ({ relativePath: filePath }) => {
      //console.clear();
      console.log(color`{yellow •} {green RELOADED} {underline ${filePath}} `);
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
        default:
          break;
      }
    });

    watcher.on('subsequent:build', async ({ relativePath: filePath, diagnostics }) => {
      if (!restartInProgress) {
        restartInProgress = true;

        console.log(color`{yellow •} {green RELOADED} {underline ${filePath}} `);
        displayCompilationMessages(diagnostics);

        const { dir, name } = parse(filePath);

        await new Promise((resolve) => {
          app.server.close(() => {
            resolve(true);
          });
        });
        setImmediate(() => { app.server.emit('close'); });

        // clean the `require` cache
        const cacheKey = `${join(CWD, 'dist', dir, name)}.js`;
        delete require.cache[cacheKey];

        if (dir.includes('Service')) {
          makeRemoteService(app, dir, name);
        }

        app = await start({ port, database, snowpack });

        restartInProgress = false;
      }
    });

    const { diagnostics } = watcher.watch(['abilities', 'config', 'controllers', 'lib', 'site', 'stylesheets'], { ignored: [] });
    print(notice("TypeScript"))

    displayCompilationMessages(diagnostics);
  }
};

const displayCompilationMessages = (messages) => {
  if (messages.length > 0) console.log(color`  {red.bold Errors:}`);
  messages.forEach(({ file, messageText }) => {
    const location = file.fileName.split(`${CWD}${sep}`)[1];
    const msg = (messageText as DiagnosticMessageChain).messageText || messageText;
    console.log(color`  {grey in} {underline ${location}}\n   → ${msg}`);
  });
};

const makeRemoteService = async (app, dir, name) => {
  const interfaceFile = await fs.readFile(`${join(CWD, dir, 'index')}.ts`, 'utf-8');
  const results = parser(interfaceFile);
  const [_interface, methods] = Object.entries(results).shift();
  const feature = _interface.split('Service').shift();

  const generatedClient = generateWebRPCOnClient(feature, methods as RemoteMethodList);
  await fs.writeFile(join(CWD, 'features', feature, 'Caller.ts'), generatedClient);

  const compiledModule = `${join(CWD, 'dist', dir, name)}.js`;
  const serviceClass = require(compiledModule).default;
  const service = new serviceClass();

  // TODO add removal of routes
  for (const [method, { input, output }] of Object.entries(methods)) {
    app.add('POST', `/rpc/${feature}/${method}`, async () => {
      const result = await service[method]();
      return JSONPayload(result, 200);
    });
  }
};

const compileCSS = async () => {
  const { plugins } = require(join(CWD, 'config', 'postcss.config'));

  try {
    const content = await fs.readFile(join(CWD, 'stylesheets', 'main.css'));
    const { css } = await postcss(plugins).process(content, {
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
  builder: (_) =>
    _.option('port', { alias: 'p', default: 5544 })
      .option('production', { type: 'boolean', default: false })
      .option('database', { type: 'boolean' })
      .default('dir', '.'),
  handler,
};
