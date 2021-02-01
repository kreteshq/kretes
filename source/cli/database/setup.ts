// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Path from 'path';
import FS from 'fs-extra';
import * as _ from 'colorette';

import { run, print, println } from '../../util';

export const handler = async () => {
  print('Setting up the database content: ');
  const { default: config } = await import('config'); // defer the config loading

  const CWD = process.cwd();

  if (!config.has("db")) {
    println(`${_.red('Error')}`)
    println(`Provide the database details in 'config/default.json'`)

    process.exit(1);
  }

  const { database, user = process.env.USER } = config.get('db');

  const stdin = FS.openSync(Path.join(CWD, 'db/setup.sql'), 'r');

  const dbLogPath = Path.join(CWD, 'log/database.log')
  await FS.ensureFile(dbLogPath)
  const stdout = FS.openSync(dbLogPath, 'a');

  process.env.PGOPTIONS='--client-min-messages=warning'

  try {
    await run('/usr/bin/env', ['psql', database, user], { stdout, stdin });
  } catch (error) {
    println(error.message);
  }

  println(` ${_.green('OK')}\n`);
}

export const command = 'setup';
