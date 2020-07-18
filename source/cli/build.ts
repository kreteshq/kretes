// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import { spawn } from 'child_process';

export const handler = async () => {
  spawn('npm', ['run', 'build'], {
    stdio: 'inherit'
  });
};

export const builder = _ => _;
