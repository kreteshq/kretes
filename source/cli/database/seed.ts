// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Path from 'path';
import FS from 'fs-extra';
import * as _ from 'colorette';
import { buildSync } from 'esbuild';

import { run, print, println } from '../../util';

const compiled = (location: string) => 
  Path.join(process.cwd(), `dist/${location}.js`);

const source = (location: string) => 
  Path.join(process.cwd(), `${location}.ts`);

export const handler = async () => {
  print('Seeding the database: ');
  const { default: config } = await import('config'); // defer the config loading

  // TODO 
  // buildSync({
  //   format: 'cjs',
  //   entryPoints: [source('db/seed')],
  //   outfile: compiled('db/seed') 
  // })

  // const { Board } = await import(compiled('db/seed'));

  if (!config.has("db")) {
    println(`${_.red('Error')}`)
    println(`Provide the database details in 'config/default.json'`)

    process.exit(1);
  }

  const { database, user = process.env.USER } = config.get('db');

  const CWD = process.cwd();
  const stdin = FS.openSync(Path.join(CWD, 'db/seed.sql'), 'r');
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

export const command = 'seed';
