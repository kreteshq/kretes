// Copyright 2018 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs-extra');
const { join, resolve } = require('path');
const { spawn } = require('child_process');
const color = require('chalk');

const { substitute } = require('../util');

const cwd = process.cwd();
const username = require('os').userInfo().username;

const VERSION = require('../package.json').version;

async function init({ dir }) {
  const themeDir = join(resolve(__dirname, '..'), 'template', 'base');

  const name = dir.replace(/-/g, '_');

  console.log(color`┌ {bold.blue Huncwot} {bold ${VERSION}}`);
  try {
    console.log(
      color`├ {cyan new}: creating project structure in {magenta ${dir}} directory ...`
    );

    // static files
    await fs.copy(themeDir, join(cwd, dir));
    await fs.rename(join(cwd, dir, 'npmrc'), join(cwd, dir, '.npmrc'));
    await fs.rename(join(cwd, dir, 'gitignore'), join(cwd, dir, '.gitignore'));

    // rename directories
    await fs.rename(join(cwd, dir, 'vscode'), join(cwd, dir, '.vscode'));

    const configTemplate = await fs.readFile(join(themeDir, 'config', 'default.yml'), 'utf-8');
    const configOutput = join(cwd, dir, 'config', 'default.yml');
    const compiled = substitute(configTemplate, {
      database: name,
      user: username
    });
    await fs.outputFile(configOutput, compiled);

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir);
    await fs.outputJson(path, content, { spaces: 2 });

    console.log(color`└ {cyan new}: installing dependencies with {magenta npm install} ...`);
    const install = spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' });
    install.on('close', () => {});
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

module.exports = {
  handler: init,
  builder: _ => _.default('dir', '.')
};

function generatePackageJSON(name) {
  const content = require('../template/base/package.json');
  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
