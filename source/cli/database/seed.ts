// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Path from 'path';
import FS from 'fs-extra';
import * as _ from 'colorette';

import { run, print, println, exists } from '../../util';

export const handler = async () => {
  print('Seeding the database: ');
  const { default: config } = await import('config'); // defer the config loading

  if (!config.has('db')) {
    println(`${_.red('Error')}`);
    println(`Provide the database details in 'config/default.json'`);

    process.exit(1);
  }

  const { database, user = process.env.USER } = config.get('db');

  const cwd = process.cwd();

  await run('/usr/bin/env', ['tsc', '-b', 'server'], { cwd });

  const seedAsCode = Path.join(cwd, '.compiled', 'server', 'db', 'seed.js');
  const seedAsSQL = Path.join(cwd, 'server', 'db/seed.sql');

  if (await exists(seedAsCode)) {
    const { main } = await import(seedAsCode);
    await main();
    println(` ${_.green('OK')}\n`);

    process.exit(0); // force closing the db connection
  } else if (await exists(seedAsSQL)) {
    const stdin = await FS.open(seedAsSQL, 'r');
    const dbLogPath = Path.join(cwd, 'log/database.log');
    await FS.ensureFile(dbLogPath);
    const stdout = await FS.open(dbLogPath, 'a');

    process.env.PGOPTIONS = '--client-min-messages=warning';

    try {
      await run('/usr/bin/env', ['psql', database, user], { stdout, stdin });
      println(` ${_.green('OK')}\n`);
    } catch (error) {
      println(error.message);
    }
  } else {
    println(` ${_.red('Error')}\n`);
    println(
      `  No ${_.underline('`seed.ts`')} or ${_.underline('`seed.sql`')} in ${_.underline(
        '`<project root>/server/db/`'
      )}`
    );
  }
};

export const command = 'seed';
