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

  Object.assign(target || {}, source);
  return target;
};

const fs = require('fs-extra');
const { join } = require('path');
const { spawn } = require('child_process');
const color = require('chalk');

const cwd = process.cwd();
const VERSION = require('../package.json').version;

const AvailableTemplates = ['vue'];

async function add({ name }) {
  if (!AvailableTemplates.includes(name)) {
    console.log(color`┌ {bold.blue Huncwot} {bold ${VERSION}}`);
    console.log(color`└ {red error}: Template '{magenta ${name}}' not recognized.`);
    return;
  }

  console.log(color`┌ {bold.blue Huncwot} {bold ${VERSION}}`);
  try {
    console.log(color`├ {cyan setup}: {magenta Vue.js} module`);

    const content = mergePackageJSONDependencies();
    await fs.outputJson(join(cwd, 'package.json'), content, { spaces: 2 });

    console.log(color`├ {cyan setup}: installing {magenta @huncwot/vue}`);

    await new Promise((resolve, reject) => {
      const child = spawn('npm', ['install'], { cwd: '.', stdio: 'inherit' });
      child.on('exit', code => {
        if (code) reject(new Error('exit code 1'));
        resolve();
      });
    });

    console.log(color`├ {cyan setup}: configuring as the {magenta Vue.js} application`);

    await new Promise((resolve, reject) => {
      const child = spawn('npx', ['huncwot-vue'], {
        cwd: '.',
        stdio: 'inherit'
      });
      child.on('exit', code => {
        if (code) reject(new Error('exit code 1'));
        resolve();
      });
    });
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

  return merge(actual, {
    dependencies: {
      '@huncwot/vue': '0.0.1'
    }
  });
};
