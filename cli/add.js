// Copyright 2019 Zaiste. All rights reserved.
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

const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(source[key], merge(target[key], source[key]));
  }

  Object.assign(target || {}, source)
  return target;
};

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const { join, resolve } = require('path');
const { spawn } = require('child_process');
const color = require('chalk');

const cwd = process.cwd();
const VERSION = require('../package.json').version;

async function add({ name }) {
  const configDirectory = join(
    resolve(__dirname, '..'),
    'template',
    'vue',
    'config'
  );

  console.log(color`┌ {bold.blue Huncwot} {bold ${VERSION}}`);
  try {
    console.log(color`├ {cyan new}: adding {magenta Vue} integration ...`);

    // copy config files
    await fs.copyAsync(configDirectory, cwd);

    const content = mergePackageJSONDependencies();
    await fs.outputJson(join(cwd, 'package.json'), content, { spaces: 2 });

    console.log(
      color`└ {cyan new}: installing dependencies for the {magenta Vue} integration ...`
    );
    const install = spawn('npm', ['install'], { cwd: '.', stdio: 'inherit' });
    install.on('close', () => { });
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

module.exports = {
  handler: add,
  builder: _ => _
};

const mergePackageJSONDependencies = () => {
  const actual = require(join(cwd, 'package.json'));
  const update = require('../template/vue/package.json');

  return merge(actual, update);
};
