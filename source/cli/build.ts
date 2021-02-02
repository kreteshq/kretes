// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { run, print, notice } from '../util';

const cwd = process.cwd();

export const handler = async () => {
  try {
    // FIXME hook Snowpack

    print(notice('Build'));
    await run('pnpx', ['tsc', '-p', './config/client/tsconfig.json'], { cwd });
    await run('pnpx', ['tsc', '-p', './config/server/tsconfig.json'], { cwd });
    print(`${__.green('done')}\n`)
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = _ => _;
