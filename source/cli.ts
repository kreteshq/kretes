#!/usr/bin/env node 

// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

process.removeAllListeners('warning')

import { valid, satisfies, validRange } from 'semver';
import yargs from 'yargs';

const {
  engines: { node: version }
} = require('../package.json');

const expected = validRange(version);
const actual = valid(process.version);

if (actual && !satisfies(actual, expected)) {
  console.error(`Expected node ${expected}, but found ${actual}`);
  process.exit(1);
}

import generate from './cli/generate';
import background from './cli/background';
import database from './cli/database';

import * as init from './cli/init';
import * as start from './cli/start';
import * as run from './cli/run';
import * as add from './cli/add';
import * as install from './cli/install';
import * as upgrade from './cli/upgrade';
import * as setup from './cli/setup';
import * as build from './cli/build';
import * as deploy from './cli/deploy';
import * as routes from './cli/routes';
import * as migrate from './cli/migrate';
import * as doctor from './cli/doctor';
import * as clean from './cli/clean';
import * as transpile from './cli/transpile';

const _argv = yargs 
  .version()
  .alias('V', 'version')
  .usage('Usage: $0 <command> [options]')
  .command(['new [dir]', 'init', 'n'], 'Create new project', init.builder, init.handler)
  .command(['start', 's'], 'Start the application', start.builder, start.handler)
  .command(['run [name...]', 'r'], 'Run custom commands', run.builder, run.handler)
  .command(['add <pkg>'], 'Add package as project dependency', add.builder, add.handler)
  .command(['install', 'i'], 'Install dependencies', install.builder, install.handler)
  .command(['upgrade', 'up'], 'Upgrade packages', upgrade.builder, upgrade.handler)
  .command(['setup'], 'Setup the development environment', setup.builder, setup.handler)
  .command(['build', 'b'], 'Build the application for production', build.builder, build.handler)
  .command(['database [command]', 'db'], 'Database operations', database)
  .command(['deploy', 'deploy', 'de'], 'Deploy the application', deploy.builder, deploy.handler)
  .command(['generate [command]', 'g'], 'Generate various artifacts', generate)
  .command(['routes', 'r'], 'Display routes', routes.builder, routes.handler)
  .command(['migrate', 'm'], 'Run database migrations', migrate.builder, migrate.handler)
  .command(['background', 'bg'], 'Run background processing', background)
  .command(['doctor', 'doc'], 'Run the doctor utility', doctor.builder, doctor.handler)
  .command(['transpile', 'ts'], 'Transpile the TypeScript files', transpile.builder, transpile.handler)
  .example('$0 new my-project', 'Create and initialize `my-project` directory')
  .example('$0 start', 'Start the application')
  .example('$0 build', 'Build the application for production')
  .example('$0 deploy', 'Deploy the application')
  .command(['clean'], 'Clear the cache', clean.builder, clean.handler)
  .strictCommands()
  .demandCommand(1, 'You need at least one command before moving on')
  .help('h')
  .alias('h', 'help')
  .epilogue('for more information, find the documentation at https://kretes.dev')
  .argv;
