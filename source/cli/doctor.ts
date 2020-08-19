// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import __ from 'chalk';

import { spawn } from 'child_process';

const cwd = process.cwd();

const VERSION = require('../../package.json').version;

export async function handler({ library }) {
  console.log(`${__.bold.blue('Kretes'.padStart(10))} ` + __`{bold ${VERSION}}`);

  try {
    const lsof = spawn('lsof', ['-t', '-i', ':5454']);
    const kill = spawn('xargs', ['kill']);

    lsof.stdout.pipe(kill.stdin);
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
}

export const builder = _ => _
