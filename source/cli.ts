#!/usr/bin/env node

// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { valid, satisfies, validRange } = require('semver');
const {
  engines: { node: version }
} = require('../package.json');

const expected = validRange(version);
const actual = valid(process.version);

if (!satisfies(actual, expected)) {
  console.error(`Expected node ${expected}, but found ${actual}`);
  process.exit(1);
}

const _argv = require('yargs')
  .version()
  .usage('Usage: $0 <command> [options]')
  .command(['new [dir]', 'init', 'n'], 'Create new project', require('./cli/init'))
  .example('$0 new my-project', 'Create and initialize `my-project` directory')
  .command(['setup [name]'], 'Setup an integration', require('./cli/setup'))
  .command(['start', 'start', 's'], 'Start the application', require('./cli/server'))
  .example('$0 start', 'Start the application')
  .command(
    ['build', 'build', 'b'],
    'Build the application for production',
    require('./cli/build')
  )
  .example('$0 build', 'Build the application for production')
  .command(['database [command]', 'db'], 'Database operations', require('./cli/database'))
  .command(['deploy', 'deploy', 'de'], 'Deploy the application', require('./cli/deploy'))
  .example('$0 deploy', 'Deploy the application')
  .command(['generate [command]', 'g'], 'Generate various artifacts', require('./cli/generate'))
  .command(['routes', 'r'], 'Display routes', require('./cli/routes'))
  .command(['migrate', 'm'], 'Run database migrations', require('./cli/migrate'))
  .command(['background', 'bg'], 'Run background processing', require('./cli/background'))
  .demandCommand(1, 'You need at least one command before moving on')
  .help('h')
  .alias('h', 'help')
  .epilogue('for more information, find the documentation at https://kretes.dev').argv;
