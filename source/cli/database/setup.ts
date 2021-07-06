// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Path from 'path';
import FS from 'fs-extra';
import * as _ from 'colorette';

import { run, print, println, exists } from '../../util';

export const handler = async () => {
  const { default: config } = await import('config'); // defer the config loading

  const cwd = process.cwd();

  if (!config.has('db')) {
    println(`${_.red('Error')}`);
    println(`Provide the database details in 'config/default.json'`);

    process.exit(1);
  }

  const { database, user = process.env.PGUSER || process.env.USER } = config.get('db');

  // FIXME this doesn't look good
  process.env.PGUSER = user;

  print(`Dropping the ${_.underline(database)} database: `);
  await run('dropdb', [database, '--if-exists'], { cwd });
  println(_.green('OK'));

  print(`Creating the ${_.underline(database)} database: `);
  await run('createdb', [database], { cwd });
  println(_.green('OK'));

  const setupAsSQL = Path.join(cwd, 'server', 'db/setup.sql');

  if (await exists(setupAsSQL)) {
    print('Setting up the database schema: ');
    const stdin = await FS.open(setupAsSQL, 'r');

    const dbLogPath = Path.join(cwd, 'log/database.log');
    await FS.ensureFile(dbLogPath);
    const stdout = await FS.open(dbLogPath, 'a');

    process.env.PGOPTIONS = '--client-min-messages=warning';

    try {
      await run('/usr/bin/env', ['psql', database, user], { stdout, stdin });
    } catch (error) {
      println(error.message);
    }

    println(` ${_.green('OK')}`);
  } else {
    println(
      `\n  The ${_.underline(
        database
      )} database has been created, but it's empty and without a schema.\n  You can define the database schema in ${_.underline(
        '<project root>/server/db/setup.sql'
      )}.\n  Then, re-run this command.`
    );
  }
};

export const command = 'setup';
