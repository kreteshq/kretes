// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const cwd = process.cwd();
import * as _ from 'colorette';

import { isDatabaseConfigured, print, println, run } from '../../util';

export const handler = async () => {
  if (!isDatabaseConfigured()) {
    println(`${_.red('Error')}`);
    println(`Provide the database details in 'config/default.json'`);

    process.exit(1);
  }

  const { default: config } = await import('config'); // defer the config loading
  const { database, user = process.env.PGUSER } = config.get('db');

  // FIXME this doesn't look good
  process.env.PGUSER = user || '';

  print(`Dropping the ${_.underline(database)} database: `);
  await run('dropdb', [database, '--if-exists'], { cwd });
  println(_.green('OK'));

  print(`Creating the ${_.underline(database)} database: `);
  await run('createdb', [database], { cwd });
  println(_.green('OK'));
};

export const command = 'reset';
