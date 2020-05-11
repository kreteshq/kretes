// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const fs = require('fs-extra');
const { join, resolve } = require('path');
const { spawn } = require('child_process');
const color = require('chalk');

const { substitute } = require('../util');

const cwd = process.cwd();
const username = require('os').userInfo().username;

const VERSION = require('../../package.json').version;

async function init({ dir, npmInstall }) {
  const themeDir = join(resolve(__dirname, '..'), 'template', 'base');

  const name = dir.replace(/-/g, '_');

  console.log(color`┌ {bold.blue Kretes} {bold ${VERSION}}`);
  console.log(
    color`├ {cyan new}: creating the project scaffold in the {underline ${dir}} directory ...`
  );

  try {
    await fs.mkdir(join(cwd, dir));

    // static files
    await fs.copy(themeDir, join(cwd, dir), { overwrite: false, errorOnExist: true });
    await fs.rename(join(cwd, dir, 'npmrc'), join(cwd, dir, '.npmrc'));
    await fs.rename(join(cwd, dir, 'gitignore'), join(cwd, dir, '.gitignore'));

    // rename directories
    await fs.rename(join(cwd, dir, 'vscode'), join(cwd, dir, '.vscode'));

    const configTemplate = await fs.readFile(join(themeDir, 'config', 'default.yml'), 'utf-8');
    const configOutput = join(cwd, dir, 'config', 'default.yml');
    const compiled = substitute(configTemplate, {
      database: name,
      user: username,
    });
    await fs.outputFile(configOutput, compiled);

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir);
    await fs.outputJson(path, content, { spaces: 2 });

    if (npmInstall) {
      console.log(color`└ {cyan new}: installing dependencies with {magenta npm install} ...`);
      const install = spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' });
      install.on('close', () => { });
    }
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.error(color`  {red Error}: Project already exists`);
    } else {
      console.error(color`  {red Error}: ${error.message}`);
    }
  }
}

module.exports = {
  handler: init,
  builder: _ => _.option('npm-install', { default: true, type: 'boolean' }).default('dir', '.'),
};

function generatePackageJSON(name) {
  const content = require('../template/base/package.json');
  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
