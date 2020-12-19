// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { exec } = require('child_process');
const { basename } = require('path');
const cwd = process.cwd();
import * as _ from 'colorette';

import { print, println } from '../../util';

export const handler = async () => {
  const { default: config } = await import('config'); // defer the config loading

  if (!config.has("db")) {
    println(`${_.red('Error')}`)
    println(`Provide the database details in 'config/default.json'`)

    process.exit(1);
  }

  const { database } = config.get('db');

  print(`Creating database '${database}': `);
  const { stdout, stderr } = exec(`createdb ${database}`, { cwd });
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);

  println(`${_.green('OK')}\n`);
}

export const command = 'create';
