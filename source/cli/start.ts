// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:start'); // eslint-disable-line no-unused-vars

import { join, parse, extname } from 'path';
import color from 'chalk';
import { TypescriptCompiler } from '@poppinss/chokidar-ts';
import fs from 'fs-extra';
import transformPaths from '@zerollup/ts-transform-paths';
import { LspWatcher } from '@poppinss/chokidar-ts/build/src/LspWatcher';
import { PluginFn } from '@poppinss/chokidar-ts/build/src/Contracts';
import * as _ from 'colorette';
import pg from 'pg';
import { createConfiguration, startServer, logger } from 'snowpack';
import dotenv from 'dotenv';

import { response } from 'retes';
const { JSONPayload } = response;

import Kretes from '../';
import { parser } from '../parser';
// const SQLCompiler = require('../compiler/sql');
import { notice, print } from '../util';
import { generateWebRPCOnClient, RemoteMethodList } from '../rpc';
import { App } from '../manifest';
import { start } from './launch';
import { SnowpackConfig } from '../config/snowpack';
import { compileCSS } from '../compiler/css';

const CWD = process.cwd();
const VERSION = require('../../package.json').version;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const startSnowpack = async () => {
  logger.level = 'silent';

  const { parsed: envs = {} } = dotenv.config();
  const snowpackEnv = Object.fromEntries(
    Object.entries(envs).filter(([name, value]) => name.startsWith('PUBLIC_'))
  );

  const { default: config } = await import('config');

  let plugins = [];
  if (config.has('snowpack')) {
    plugins = config.get('snowpack.plugins');
  }

  const snowpackPlugins = Object.entries(plugins).map<[string, any]>(([name, options]) => [
    `@snowpack/plugin-${name}`,
    options,
  ]);

  const snowpackConfig = createConfiguration({
    ...SnowpackConfig,
    ...(process.env.KRETES === 'production' && {
      mode: 'production',
      devOptions: {
        hmr: false,
      },
    }),
    plugins: [
      ...snowpackPlugins,
      ['@snowpack/plugin-postcss', { config: join(process.cwd(), 'config', 'postcss.config.js') }],
      ['kretes-snowpack-refresh', {}],
    ],
  });

  const server = await startServer({
    config: {
      ...snowpackConfig,
      env: snowpackEnv,
    },
    lockfile: null,
  });

  return server;
};

export const handler = async ({ port, production, database }) => {
  print(notice('Kretes'));
  process.env.KRETES = process.env.NODE_ENV = production ? 'production' : 'development';

  const config = require('config');

  // FIXME don't read two times, e.g in Snowpack
  const { error, parsed } = dotenv.config();
  if (error) {
    throw error;
  }

  let app: Kretes;

  const connection = config.has('db') ? config.get('db') : {}; // node-pg supports env variables

  let databaseConnected = false;
  try {
    App.DatabasePool = new pg.Pool(connection);
    await App.DatabasePool.connect();
    databaseConnected = true;
    print(notice('OK')('Database'));
  } catch (error) {
    print(notice('Error')('Database')(error));
    print(notice('Explain')(error));

    // can continue
  }

  const isGraphQL = config.has('graphql') ? config.get('graphql') : false;

  if (production) {
    await fs.ensureDir('.compiled/tasks');

    const snowpack = await startSnowpack();

    app = await start({ port, database: databaseConnected, snowpack, isGraphQL });
  } else {
    await fs.emptyDir('public');

    const TS = require('typescript/lib/typescript');
    const compiler = new TypescriptCompiler(CWD, 'config/server/tsconfig.json', TS);
    const { error, config } = compiler.configParser().parse();

    if (error || !config || config.errors.length) {
      console.error(error.messageText);
      return;
    }

    const snowpack = await startSnowpack();
    print(notice('Snowpack'));

    // transforms `paths` defined in tsconfig.json
    // for the server-side code
    //@ts-ignore
    const plugin: PluginFn = (ts, _config) => {
      const { options, fileNames } = config;
      const host = ts.createCompilerHost(options);
      const program = ts.createProgram(fileNames, options, host);
      const r = transformPaths(program);
      return (context) => r.before(context);
    };

    compiler.use(plugin, 'before');

    let restartInProgress = false;

    const watcher = compiler.watcher(config, 'lsp') as LspWatcher;
    watcher.on('watcher:ready', async () => {
      // const stream = fg.stream([`${CWD}/features/**/*.sql`], { dot: true });
      // for await (const entry of stream) await reloadSQL(pool, entry);

      await fs.ensureDir('.compiled/tasks');

      // start the HTTP server
      app = await start({ port, database: databaseConnected, snowpack, isGraphQL });

      await compileCSS();
      print(notice('CSS'));

      print(notice('Listening')(port));
      print(notice('Logs'));
    });

    watcher.on('subsequent:build', async ({ relativePath: filePath, skipped, diagnostics }) => {
      if (!restartInProgress) {
        restartInProgress = true;

        console.log(color`{yellow •} {green RELOADED} {underline ${filePath}} `);

        // FIXME instead of displaying error messages,
        // display just the info about errors to check
        // in VS Code
        // displayCompilationMessages(diagnostics);

        const { dir, name } = parse(filePath);

        setImmediate(() => {
          app.server.emit('close');
        });
        await new Promise((resolve) => {
          app.server.close(() => {
            resolve(true);
          });
        });

        // clean the `require` cache
        const serverCursor = join(CWD, '.compiled', 'server');
        const apiCursor = join(CWD, '.compiled', 'site', '_api');

        debug('clean require.cache');
        for (const key of Object.keys(require.cache)) {
          // TODO change to RegEx
          // if (key.includes(controllersCursor) || key.includes(apiCursor)) {
          delete require.cache[key];
          // }
        }
        debug('require.cache cleaned');
        // const cacheKey = `${join(CWD, 'dist', dir, name)}.js`;

        if (dir.includes('Service')) {
          makeRemoteService(app, dir, name);
        }

        app = await start({ port, database, snowpack, isGraphQL });

        restartInProgress = false;
      }
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

    watcher.watch(
      ['app/abilities', 'app/controllers', 'app/graphql', 'config', 'lib', 'site', 'stylesheets'],
      {
        ignored: [],
      }
    );

    print(notice('TypeScript'));
  }
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

export const builder = (_) =>
  _.option('port', { alias: 'p', default: 5544 })
    .option('production', { type: 'boolean', default: false })
    .option('database', { type: 'boolean' })
    .default('dir', '.');
