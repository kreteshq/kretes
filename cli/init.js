// Copyright 2016 Zaiste & contributors. All rights reserved.
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
const exec = require('child_process').exec;

const cwd = process.cwd();

async function init({ dir }) {
  const themeDir = join(resolve(__dirname, '..'), 'template');

  try {
    process.stdout.write(
      `Initialising '${dir}'... `
    );

    await fs.copyAsync(themeDir, join(cwd, dir));
    const isYarnInstalled = await hasbin('yarn');

    if (isYarnInstalled) {
      exec(`yarn`, { cwd: dir }).stdout.pipe(process.stdout);
      console.log('done');
    } else {
      console.error('\nError: `yarn` is not installed. Please check their installation guide at https://yarnpkg.com/en/docs/install to learn how to install `yarn` on your platform');
    }
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

async function hasbin(name) {
  return await Promise.resolve(process.env.PATH.split(delimiter).map(_ => join(_, name)))
    .map(exists)
    .reduce((a, b) => a || b)
}

async function exists(pathname) {
  try {
    await fs.accessAsync(pathname);
    return true
  } catch (error) {
    return false;
  }
}

module.exports = {
  handler: init,
  builder: _ =>
    _.default('dir', '.')
};
