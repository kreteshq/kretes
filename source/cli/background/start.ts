// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:background'); // eslint-disable-line no-unused-vars

import { Pool } from 'pg';
import { run } from 'graphile-worker';

export const handler = async () => {
  const pgPool = new Pool();
  const taskDirectory = `${process.cwd()}/dist/tasks`;

  const _runner = await run({ pgPool, taskDirectory });
};

export const builder = _ => _;
