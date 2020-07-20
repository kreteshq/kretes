// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:cli:migrate'); // eslint-disable-line no-unused-vars

import { spawn } from 'child_process';

export const handler = () => {
  spawn('npx', ['node-pg-migrate'], { stdio: 'inherit' });
};

export const builder = _ => _;
