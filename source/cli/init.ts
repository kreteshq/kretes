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

const TemplateNaming = {
  react: 'React.js',
  vue: 'Vue.js',
  svelte: 'Svelte'
}

export async function handler({ dir, installDependencies, template }) {
  const templateDir = join(resolve(__dirname, '..', '..'), 'template');
  const themeDir = join(templateDir, 'base');

  const name = dir.replace(/-/g, '_');

  print(`${bold(blue('Kretes'.padStart(10)))} ${bold(VERSION)}`);

  const isNixInstalled = await lookpath('nix-shell');
  if (!isNixInstalled) {
    console.error(`${red('Error'.padStart(10))}: Kretes requires the Nix package manager`);
    console.error(`${''.padStart(12)}${__.gray('https://nixos.org/guides/install-nix.html')}`);
    process.exit(1);
  }

  print(`${magenta('new'.padStart(10))} creating a project in ${underline(dir)}${template !== 'base' ? ` using the ${underline(TemplateNaming[template])} template` : ''}`);

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

    // parametrize `default.nix`
    const tmplDefaultNix = await fs.readFile(join(themeDir, 'default.nix'), 'utf-8');
    const outputDefaultNix = join(cwd, dir, 'default.nix');
    await fs.outputFile(outputDefaultNix, substitute(tmplDefaultNix, { name }));

    // parametrize `settings.json`
    const tmplVSCodeSettings = await fs.readFile(join(themeDir, 'vscode', 'settings.json'), 'utf-8');
    const outputVSCodeSettings = join(cwd, dir, '.vscode', 'settings.json');
    await fs.outputFile(outputVSCodeSettings, substitute(tmplVSCodeSettings, { name }));


    // Setup development database
    const stdout = fs.openSync(join(cwd, dir, 'log/database.log'), 'a');

    await run('/usr/bin/env', ['nix-shell', '--pure', '--run', 'initdb -A trust --encoding=UTF8 --locale=en_US.UTF-8 --lc-collate=C'], { stdout, cwd: projectDir  });
    await run('/usr/bin/env', ['nix-shell', '--pure', '--run', 'pg_ctl start -o "-k /tmp" -l ./log/postgresql.log'], { stdout, cwd: projectDir });
    await run('/usr/bin/env', ['nix-shell', '--pure', '--run', `createdb ${name}`], { cwd: projectDir });
    await run('/usr/bin/env', ['nix-shell', '--pure', '--run', 'pg_ctl stop -o "-k /tmp" -l ./log/postgresql.log'], { stdout, cwd: projectDir });

    // apply specific template changes
    if (template !== "base") {
      await fs.copy(join(templateDir, template), join(cwd, dir), { overwrite: true, errorOnExist: true });
      await fs.remove(join(cwd, dir, 'config', 'client', 'index.ts'));
      await fs.remove(join(cwd, dir, 'features', 'Base', 'View', 'index.ts'));
    }

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir, template);
    await fs.outputJson(path, content, { spaces: 2 });

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

export const builder = _ => _
  .option('install-dependencies', { default: true, type: 'boolean' })
  .option('template', {
    type: 'string',
    choices: ['base', 'react', 'vue', 'preact'],
    default: 'base'
  })
  .default('dir', '.');

function generatePackageJSON(name, template = 'base') {
  const content = require('../../template/base/package.json');

  if (template === 'react') {
    const { dependencies, devDependencies } = require('../../template/react/package.json');

    Object.assign(content.dependencies, dependencies)
    Object.assign(content.devDependencies, devDependencies);
  }

  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
