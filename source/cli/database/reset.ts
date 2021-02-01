// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { exec } = require('child_process');
const cwd = process.cwd();
import * as _ from 'colorette';

import { print, println, run } from '../../util';

export const handler = async () => {
  const { default: config } = await import('config'); // defer the config loading

  if (!config.has("db")) {
    println(`${_.red('Error')}`)
    println(`Provide the database details in 'config/default.json'`)

    process.exit(1);
  }

  const { database } = config.get('db');

  print(`Droping database '${database}': `);
  await run('dropdb', [database, '--if-exists'], { cwd });
  println(_.green('OK'));

  print(`Creating database '${database}': `);
  await run('createdb', [database], { cwd });
  println(_.green('OK'));
}

export const command = 'reset';
