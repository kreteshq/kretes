// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { run, print } from '../../util';

const cwd = process.cwd();

export const handler = async () => {
  try {
    print('Starting Docker containers:\n')
    await run('/usr/bin/env', ['docker', 'network', 'create', 'kretes-network'], { cwd });
    await run('/usr/bin/env', ['docker', 'run', '-d', '--network kretes-network', '--name app', 'kretes:app'], { cwd });
    await run('/usr/bin/env', ['docker', 'run', '-d', '--network kretes-network', '--link app:kretes', 'kretes:nginx'], { cwd });
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = _ => _;
