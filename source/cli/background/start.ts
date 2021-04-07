// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:background'); // eslint-disable-line no-unused-vars

import { Pool } from 'pg';
import { run } from 'graphile-worker';

import Logger from '../../logger';
import { Argv } from 'yargs';

export const handler = async () => {
  const pgPool = new Pool();
  const taskDirectory = `${process.cwd()}/dist/tasks`;

  try {
    const _runner = await run({ pgPool, taskDirectory });
  } catch (error) {
    Logger.printError(error)
    pgPool.end();
  }
};

export const builder = (_: Argv) => _;
export const command = 'start';
