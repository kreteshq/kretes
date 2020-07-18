// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:background'); // eslint-disable-line no-unused-vars

import { spawn, SpawnOptions } from 'child_process';

export const handler = async () => {
  const { default: config } = await import('config'); // defer the config loading
  const { database, username } = config.get('db');
  console.log(`Connecting to '${database}' database...`);

  const cwd = process.cwd();
  const options: SpawnOptions = { cwd, stdio: 'inherit' };

  spawn('psql', [database, username], options);
}

export const command = 'console';
