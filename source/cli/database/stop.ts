// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import color from 'chalk';
import FS from 'fs';

import { run, print, println } from '../../util';
import { verifyIfInNixEnvironment } from '../../nix';

export const handler = async () => {
  verifyIfInNixEnvironment();

  print('Stopping database: ');

  const DatabaseLog = "log/database.log";
  const command = ["nix-shell", "--run", `pg_ctl stop -o "-k /tmp" -l ${DatabaseLog}`];
  const log = FS.openSync(DatabaseLog, "a");
  try {
    await run("/usr/bin/env", command, { stdout: log });
    print(color` {green OK}\n`);
  } catch (error) {
    print(color` {red Error}\n`);
    println(error.message);
  }
}

export const command = 'stop';
