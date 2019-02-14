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

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const { join, resolve, delimiter } = require('path');
const { spawn } = require('child_process');

const { substitute } = require('../util');

const cwd = process.cwd();
const username = require('os').userInfo().username;

async function init({ dir }) {
  const themeDir = join(resolve(__dirname, '..'), 'template');

  const name = dir.replace(/-/g, '_');

  try {
    console.log(`Initialising '${dir}'...`);

    // static files
    await fs.copyAsync(themeDir, join(cwd, dir));

    const configTemplate = await fs.readFile(
      join(themeDir, 'config', 'default.json5'),
      'utf-8'
    );
    const configOutput = join(cwd, dir, 'config', 'default.json5');
    const compiled = substitute(configTemplate, {
      database: name,
      user: username
    });
    await fs.outputFile(configOutput, compiled);

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir);
    await fs.outputJson(path, content, { spaces: 2 });

    const install = spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' });
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

module.exports = {
  handler: init,
  builder: _ => _.default('dir', '.')
};

function generatePackageJSON(name) {
  const content = require('../template/package.json');
  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}
