// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import * as fs from 'fs-extra';
import { join, resolve } from 'path';
import { spawn } from 'child_process';
import __ from 'chalk';
import { red } from 'colorette';

import { substitute, print, notice } from '../util';

const cwd = process.cwd();

export async function handler({ dir, installDependencies, template }) {
  const templateDir = join(resolve(__dirname, '..', '..'), 'template');
  const themeDir = join(templateDir, 'base');

  const name = dir.replace(/-/g, '_');

  print(notice('Kretes'))
  print(notice('New')(dir, template));

  try {
    await fs.mkdir(join(cwd, dir));
    await fs.mkdir(join(cwd, dir, 'log'));

    // static files
    await fs.copy(themeDir, join(cwd, dir), { overwrite: false, errorOnExist: true });
    await fs.rename(join(cwd, dir, 'npmrc'), join(cwd, dir, '.npmrc'));
    await fs.rename(join(cwd, dir, 'gitignore'), join(cwd, dir, '.gitignore'));
    await fs.rename(join(cwd, dir, 'env'), join(cwd, dir, '.env'));

    // rename directories
    await fs.rename(join(cwd, dir, 'vscode'), join(cwd, dir, '.vscode'));

    // parametrize `default.nix`
    const tmplDefaultNix = await fs.readFile(join(themeDir, 'default.nix'), 'utf-8');
    const outputDefaultNix = join(cwd, dir, 'default.nix');
    await fs.outputFile(outputDefaultNix, substitute(tmplDefaultNix, { name }));

    // parametrize `settings.json`
    const tmplVSCodeSettings = await fs.readFile(join(themeDir, 'vscode', 'settings.json'), 'utf-8');
    const outputVSCodeSettings = join(cwd, dir, '.vscode', 'settings.json');
    await fs.outputFile(outputVSCodeSettings, substitute(tmplVSCodeSettings, { name }));

    // apply specific template changes
    if (!['base'].includes(template)) {
      await fs.copy(join(templateDir, template), join(cwd, dir), { overwrite: true, errorOnExist: true });
    }

    if (!['base', 'vue'].includes(template)) {
      await fs.remove(join(cwd, dir, 'config', 'client', 'index.ts'));
      await fs.remove(join(cwd, dir, 'site', 'index.ts'));
    }

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir, template);
    await fs.outputJson(path, content, { spaces: 2 });

    if (installDependencies) {
      print(notice('Deps'));
      const install = spawn('npx', ['pnpm', 'install'], { cwd: dir, stdio: 'inherit' });
      install.on('close', () => {
        print(notice('Finish')(dir))
      });
    } else {
      print(notice('Finish')(dir))
    }

  } catch (error) {
    if (error.code === 'EEXIST') {
      console.error(`${red('Error'.padStart(10))}  Project already exists`);
    } else {
      console.error(__`  {red Error}  ${error.message}`);
    }
  }
}

export const builder = _ => _
  .option('install-dependencies', { default: true, type: 'boolean' })
  .option('template', {
    type: 'string',
    choices: ['base', 'react', 'vue', 'preact', 'solid'],
    default: 'base'
  })
  .default('dir', '.');

function generatePackageJSON(name, template = 'base') {
  const content = require('../../template/base/package.json');

  if (template !== 'base') {
    const { dependencies, devDependencies } = require(`../../template/${template}/package.json`);

    Object.assign(content.dependencies, dependencies)
    Object.assign(content.devDependencies, devDependencies);
  }

  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
