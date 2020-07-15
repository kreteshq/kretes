// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import __ from 'chalk';

import { run } from '../util';

const cwd = process.cwd();

const VERSION = require('../../package.json').version;

export async function handler({ library }) {
  console.log(`${__.bold.blue('Kretes'.padStart(10))} ` + __`{bold ${VERSION}}`);
  console.log(__`{magenta ${'add'.padStart(10)}} {underline ${library}}`);

  try {
    await run('npx', ['pnpm', 'add', library], { cwd });
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
}

export const builder = _ => _
