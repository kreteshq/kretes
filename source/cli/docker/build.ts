// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:cli:build'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { run, print } from '../../util';

const cwd = process.cwd();

export const handler = async () => {
  try {
    print('Building Docker containers:\n')
    print('    app: ')
    await run('/usr/bin/env', ['docker', 'build', '-f', './config/docker/Dockerfile.app', '--tag kretes:app', '.'], { cwd });
    print(`${__.green('done')}\n`)
    print('  nginx: ')
    // todo
    // await run('/usr/bin/env', ['docker', 'build', '-f', './config/docker/Dockerfile.nginx', '--tag kretes:nginx', '.'], { cwd });
    print(`${__.green('done')}\n`)
  } catch (error) {
    console.error(__`  {red Error}: ${error.message}`);
  }
};

export const builder = _ => _;
