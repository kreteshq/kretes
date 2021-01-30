// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { run, print } from '../../util';
import { Argv } from 'yargs';

const cwd = process.cwd();

export const handler = async () => {
  try {
    print('Starting Docker containers:\n')
    await run('/usr/bin/env', ['docker', 'compose', '-f', './config/docker/docker-compose.yml', 'up'], { cwd });
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = (_: Argv) => _;
