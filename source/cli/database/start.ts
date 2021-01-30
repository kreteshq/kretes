// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import color from 'chalk';
import FS from 'fs';

import { run, print, println } from '../../util';
import { verifyIfInNixEnvironment } from '../../nix';
import { Argv } from 'yargs';

export async function handler({ daemon }: { daemon: boolean }) {
  verifyIfInNixEnvironment();

  if (daemon) {
    print('Starting database: ');

    const DatabaseLog = "log/database.log";

    const command = ["nix-shell", "--run", `pg_ctl restart -o "-k /tmp" -l ${DatabaseLog}`];
    const log = FS.openSync(DatabaseLog, "a");

    await run("/usr/bin/env", command, { stdout: log, stderr: log });
    print(color` {green OK}\n`);

    println(color`Details at: {underline ${DatabaseLog}}`);
  } else {
    const command = ["nix-shell", "--run", `postgres -k /tmp`];
    await run("/usr/bin/env", command);
  }
}

export const builder = (_: Argv) => _
  .option('daemon', { default: false, type: 'boolean' })
export const command = 'start';
