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
const cwd = process.cwd();

const { join } = require('path');
const color = require('chalk');

const Huncwot = require('../');

const VERSION = require('../package.json').version;

async function serve({ port }) {
  let server = join(cwd, 'app');

  try {
    require(server);
  } catch (_) {
    const app = new Huncwot();
    app.listen(port);
  }

  console.log(
    `${color.bold.blue('Huncwot:')} ${color.underline(
      VERSION
    )} (started on ${color.grey(
      new Date()
        .toISOString()
        .split('.')
        .shift()
        .replace('T', ' ')
    )})`
  );
}

module.exports = {
  builder: _ =>
    _.option('port', { alias: 'p', default: 5544 }).default('dir', '.'),
  handler: serve
};
