// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';
import { join } from 'path';
import { build, createConfiguration } from 'snowpack';
import fs from 'fs-extra';
import transformPaths from '@zerollup/ts-transform-paths';
import { PluginFn } from '@poppinss/chokidar-ts/build/src/Contracts';
import { TypescriptCompiler } from '@poppinss/chokidar-ts';
import dotenv from 'dotenv';

import { print, notice, println } from '../util';
import { SnowpackConfig as DefaultSnowpackConfig } from '../config/snowpack';
import { compileCSS } from '../compiler/css';

const compileServerSide = () => {
  const TS = require('typescript/lib/typescript');
  const compiler = new TypescriptCompiler(process.cwd(), 'config/server/tsconfig.json', TS);
  const { error, config } = compiler.configParser().parse()
  if (error || !config) {
    console.log(error)
    return
  }

  if (config.errors.length) {
    console.log(config.errors)
    return
  }

  //@ts-ignore
  const plugin: PluginFn = (ts, _config) => {
    const { options, fileNames } = config;
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram(fileNames, options, host);
    const r = transformPaths(program);
    return context => r.before(context);
  };

  compiler.use(plugin, 'before');

  const { diagnostics } = compiler.builder(config!).build()

  return diagnostics;
}

export const handler = async () => {
  const cwd = process.cwd();

  process.env.KRETES = process.env.NODE_ENV = 'production'; 

  try {
    println(notice('Build'));

    const { parsed: envs = {} } = dotenv.config();
    const env = Object.fromEntries(Object.entries(envs)
      .filter(([name, value]) => name.startsWith("PUBLIC_")));

    const config = createConfiguration({
      ...DefaultSnowpackConfig,
      env, 
      plugins: [
        ["@snowpack/plugin-postcss", { config: join(process.cwd(), 'config', 'postcss.config.js') }],
      ]
    })

    const result = await build({ config, lockfile: null });

    const indexHTML = join(cwd, 'public', 'index.html');
    let html = await fs.readFile(indexHTML, 'utf-8')
    // html = html!.replace('</body>', `${scriptSnippet}\n</body>`)
    await fs.outputFile(indexHTML, html);

    await compileCSS();

    const diagnostics = compileServerSide();

    print(`${__.green('done')}\n`)

    process.exit(0) // FIXME bug in Snowpack API, it doesn't stop
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = _ => _;
