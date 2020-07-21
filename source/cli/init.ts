// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import * as fs from 'fs-extra';
import { join, resolve } from 'path';
import { spawn } from 'child_process';
import __ from 'chalk';
import { lookpath } from 'lookpath';
import { red, gray, magenta, underline, cyan, blue, bold } from 'colorette';

import { substitute, run, print } from '../util';

const cwd = process.cwd();
const username = require('os').userInfo().username;

const VERSION = require('../../package.json').version;

export async function handler({ dir, installDependencies }) {
  const themeDir = join(resolve(__dirname, '..', '..'), 'template', 'base');

  const name = dir.replace(/-/g, '_');

  print(`${bold(blue('Kretes'.padStart(10)))} ${bold(VERSION)}`);

  const isNixInstalled = await lookpath('nix-shell');
  if (!isNixInstalled) {
    console.error(`${red('Error'.padStart(10))}: Kretes requires the Nix package manager`);
    console.error(`${''.padStart(12)}${__.gray('https://nixos.org/guides/install-nix.html')}`);
    process.exit(1);
  }

  print(`${magenta('new'.padStart(10))} creating a project in ${underline(dir)}`);

  const projectDir = join(cwd, dir);

  try {
    await fs.mkdir(join(cwd, dir));
    await fs.mkdir(join(cwd, dir, 'log'));

    // static files
    await fs.copy(themeDir, join(cwd, dir), { overwrite: false, errorOnExist: true });
    await fs.rename(join(cwd, dir, 'npmrc'), join(cwd, dir, '.npmrc'));
    await fs.rename(join(cwd, dir, 'gitignore'), join(cwd, dir, '.gitignore'));

    // rename directories
    await fs.rename(join(cwd, dir, 'vscode'), join(cwd, dir, '.vscode'));

    const configTemplate = await fs.readFile(join(themeDir, 'config', 'default.json'), 'utf-8');
    const configOutput = join(cwd, dir, 'config', 'default.json');
    const compiled = substitute(configTemplate, {
      database: name,
      user: username,
    });
    await fs.outputFile(configOutput, compiled);

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir);
    await fs.outputJson(path, content, { spaces: 2 });

    // Setup development database
    const stdout = fs.openSync(join(cwd, dir, 'log/database.log'), 'a');

    await run('/usr/bin/env', ['nix-shell', '--run', 'initdb -A trust'], { stdout, cwd: projectDir  });
    await run('/usr/bin/env', ['nix-shell', '--run', 'pg_ctl start -l ./log/postgresql.log'], { stdout, cwd: projectDir });
    await run('/usr/bin/env', ['nix-shell', '--run', `createdb ${name}`], { cwd: projectDir });
    await run('/usr/bin/env', ['nix-shell', '--run', 'pg_ctl stop -l ./log/postgresql.log'], { stdout, cwd: projectDir });

    if (installDependencies) {
      print(`${magenta('new'.padStart(10))} installing dependencies`);
      const install = spawn('npx', ['pnpm', 'install'], { cwd: dir, stdio: 'inherit' });
      install.on('close', () => { });
    }
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.error(`${red('Error'.padStart(10))} Project already exists`);
    } else {
      console.error(__`  {red Error}: ${error.message}`);
    }
  }
}

export const builder = _ => _.option('install-dependencies', { default: true, type: 'boolean' }).default('dir', '.');

function generatePackageJSON(name) {
  const content = require('../../template/base/package.json');
  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
