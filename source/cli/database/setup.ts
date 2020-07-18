// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { run } from '../../util';

export const handler = async () => {
  console.log('Setting up database...');
  const { default: config } = await import('config'); // defer the config loading
  const cwd = process.cwd();

  const { database, username } = config.get('db');

  await run('/usr/bin/env', ['nix-shell', '--run', 'initdb']);
  await run('/usr/bin/env', ['nix-shell', '--run', 'pg_ctl start -l ./log/postgresql.log']);
  await run('/usr/bin/env', ['nix-shell', '--run', `createdb ${database}`]);
  await run('/usr/bin/env', ['nix-shell', '--run', 'pg_ctl stop -l ./log/postgresql.log']);

  // const psql = `psql ${database} ${username} < db/setup.sql`;
  // const { stdout, stderr } = exec(psql, { cwd });

  // stdout.pipe(process.stdout);
  // stderr.pipe(process.stderr);
}

export const command = 'setup';
