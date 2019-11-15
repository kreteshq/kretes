// Copyright 2019 Zaiste & contributors. All rights reserved.
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

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const util = require('util');
const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs-extra');

const cwd = process.cwd();

const client = async () => {

  const template = join(cwd, 'config/client', 'index.html');
  const tmpl = (await fs.readFile(template)).toString('utf8');
  const bodyCloseTag = tmpl.lastIndexOf('</body>');
  let prefix = '';

  const bundles = ['index.js'];

  const injected = [
    tmpl.slice(0, bodyCloseTag),
    ...bundles.map(
      b => `<script type="module" src="${prefix || ''}${b}"></script>\n`
    ),
    tmpl.slice(bodyCloseTag, tmpl.length)
  ].join('');

  await new Promise(resolve => {
    const child = spawn('npx', ['pika', 'install', '--dest', 'modules'], {
      stdio: 'inherit'
    });
    child.on('exit', _ => resolve());
  });

  await fs.copy(join(cwd, 'modules'), join(cwd, 'public', 'modules'));
  await fs.outputFile(join(cwd, 'public', 'index.html'), injected);

  spawn(
    'npx',
    [
      'rollup',
      '--config',
      'config/client/rollup.config.js',
      '--format',
      'esm',
      '--watch'
    ],
    {
      stdio: 'inherit'
    }
  );
};

module.exports = {
  builder: _ => _,
  handler: client
};
