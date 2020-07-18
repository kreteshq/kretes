// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { spawn, SpawnOptions } from 'child_process';

export const handler = ({ password }) => {
  const cwd = process.cwd();

  const options: SpawnOptions = { cwd, stdio: 'inherit', shell: true };
  spawn(`echo ${password} | argon2-cli -e`, [], options);
};

export const command = 'password-hash <password>';
