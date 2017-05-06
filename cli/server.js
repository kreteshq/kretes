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

const debug = require('debug')('server');
const { join, resolve } = require('path');
const chokidar = require('chokidar');

const currentDirectory = process.cwd();

function serve({ port, dir }) {
  const watcher = chokidar.watch(dir, {
    ignored: /[\/\\]\./,
    persistent: true,
    cwd: '.'
  });

  watcher.on('change', () => {})

  require(join(currentDirectory, 'server.js'));

  console.log(`---\nServer running at http://localhost:${port}`);
}

module.exports = {
  builder: _ => _
    .option('port', { alias: 'p', default: 3000 })
    .default('dir', '.'),
  handler: serve
};
