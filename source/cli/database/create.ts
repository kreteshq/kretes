// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { exec } = require('child_process');
const { basename } = require('path');
const cwd = process.cwd();

export const handler = () => {
  let app = basename(cwd);
  app = app.split('-').join('_');

  console.log(`Creating database... ${app}`);
  const { stdout, stderr } = exec(`createdb ${app}`, { cwd });
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
}

export const command = 'create';
