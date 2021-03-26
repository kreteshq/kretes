// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';
import { Argv } from 'yargs';

import { run, print } from '../../util';

const cwd = process.cwd();

export const handler = async () => {
  const command = [
    'docker', 'compose', 
    '-f', './config/docker/docker-compose.yml', 
    'up'
  ];

  try {
    print('Starting the Docker container:\n')
    await run('/usr/bin/env', command, { cwd });
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = (_: Argv) => _;
