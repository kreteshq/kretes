// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { run } from '../util';

const cwd = process.cwd();

export const handler = async ({ name }) => {
  const { default: config } = await import('config'); // defer the config loading

  try {
    const command: string = config.get(['commands', ...name].join('.'))
    await run('/usr/bin/env', command.split(' '), { cwd });
  } catch (error) {
    console.error(__`  {red Error}: Command '${name.join(' ')}' not defined in the config`);
  }
};

export const builder = _ => _;
