// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { exec } = require('child_process');
const config = require('config');
const cwd = process.cwd();

function handler(_) {
  console.log('Setting up database...');

  const { database, username } = config.get('db');
  const psql = `psql ${database} ${username} < db/setup.sql`;
  const { stdout, stderr } = exec(psql, { cwd });

  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
}

module.exports = {
  command: 'setup',
  builder: {},
  handler,
};
