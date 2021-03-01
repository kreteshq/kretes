#!/usr/bin/env node

// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { valid, satisfies, validRange } from 'semver';
const {
  engines: { node: version }
} = require('../package.json');

const expected = validRange(version);
const actual = valid(process.version);

if (actual && !satisfies(actual, expected)) {
  console.error(`Expected node ${expected}, but found ${actual}`);
  process.exit(1);
}

const _argv = require('yargs')
  .version()
  .alias('V', 'version')
  .usage('Usage: $0 <command> [options]')
  .command(['new [dir]', 'init', 'n'], 'Create new project', require('./cli/init'))
  .command(['start', 's'], 'Start the application', require('./cli/start'))
  .command(['run'], 'Start the application', require('./cli/run'))
  .command(['add <pkg>'], 'Add package as project dependency', require('./cli/add'))
  .command(['install', 'i'], 'Install dependencies', require('./cli/install'))
  .command(['upgrade', 'up'], 'Upgrade packages', require('./cli/upgrade'))
  .command(['setup'], 'Setup the development environment', require('./cli/setup'))
  .command(['build', 'b'], 'Build the application for production', require('./cli/build'))
  .command(['database [command]', 'db'], 'Database operations', require('./cli/database'))
  .command(['deploy', 'deploy', 'de'], 'Deploy the application', require('./cli/deploy'))
  .command(['generate [command]', 'g'], 'Generate various artifacts', require('./cli/generate'))
  .command(['docker [command]'], 'Docker interface', require('./cli/docker'))
  .command(['routes', 'r'], 'Display routes', require('./cli/routes'))
  // .command(['migrate', 'm'], 'Run database migrations', require('./cli/migrate'))
  .command(['background', 'bg'], 'Run background processing', require('./cli/background'))
  .command(['doctor', 'doc'], 'Run the doctor utility', require('./cli/doctor'))
  .example('$0 new my-project', 'Create and initialize `my-project` directory')
  .example('$0 start', 'Start the application')
  // .example('$0 build', 'Build the application for production')
  // .example('$0 deploy', 'Deploy the application')
  .command(['clean'], 'Clear the cache', require('./cli/clean'))
  .strictCommands()
  .demandCommand(1, 'You need at least one command before moving on')
  .help('h')
  .alias('h', 'help')
  .epilogue('for more information, find the documentation at https://kretes.dev')
  .argv;
