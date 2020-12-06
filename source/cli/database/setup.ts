// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Path from 'path';
import FS from 'fs';
import * as _ from 'colorette';

import { run, print, println } from '../../util';

export const handler = async () => {
  print('Setting up the database: ');
  const { default: config } = await import('config'); // defer the config loading

  const CWD = process.cwd();

  if (!config.has("db")) {
    println(`${_.red('Error')}`)
    println(`Provide the database details in 'config/default.json'`)

    process.exit(1);
  }

  const { database, username } = config.get('db');

  // Setup development database
  const stdout = FS.openSync(Path.join(CWD, 'log/database.log'), 'a');

  // FIXME investigate: no `pure` as `locale` error on MacOS
  try {
    await run('/usr/bin/env', ['nix-shell', '--run', 'initdb -A trust --encoding=UTF8 --locale=en_US.UTF-8 --lc-collate=C'], { stdout });
  } catch (error) {
    println(error.message);
  }
  await run('/usr/bin/env', ['nix-shell', '--pure', '--run', 'pg_ctl start -o "-k /tmp" -l ./log/postgresql.log'], { stdout });
  await run('/usr/bin/env', ['nix-shell', '--pure', '--run', `createdb ${database}`]);
  await run('/usr/bin/env', ['nix-shell', '--pure', '--run', 'pg_ctl stop -o "-k /tmp" -l ./log/postgresql.log'], { stdout });

  // const psql = `psql ${database} ${username} < db/setup.sql`;
  // const { stdout, stderr } = exec(psql, { cwd });

  // stdout.pipe(process.stdout);
  // stderr.pipe(process.stderr);

  println(` ${_.green('OK')}\n`);
}

export const command = 'setup';
