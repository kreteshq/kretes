// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';
import { Argv } from 'yargs';
import { join } from 'path';

import { run, print } from '../../util';

const cwd = process.cwd();

export const handler = async () => {
  const { name } = require(join(cwd, 'package.json'));

  const command = [
    'docker', 'build', 
    '-f', './config/docker/Dockerfile', 
    '--tag', `kretes:${name}`, 
    '.'
  ];

  try {
    print('Building the Docker image:\n')
    await run('/usr/bin/env', command, { cwd });
    print(`${__.green('done')}\n`)
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = (_: Argv) => _;
