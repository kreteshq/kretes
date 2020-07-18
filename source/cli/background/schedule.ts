// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:background'); // eslint-disable-line no-unused-vars

import { quickAddJob } from "graphile-worker";

export const handler = async ({ task, payload = '{}', options = {} }) => {
  const { default: config } = await import('config'); // defer the config loading
  const connectionString: string = `postgresql:///${config.get('db.database')}`;

  await quickAddJob({ connectionString }, task, JSON.parse(payload))
} ;

export const builder = _ => _;
export const command = 'schedule <task> [payload]';
