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

const { exec } = require('child_process');
const { basename } = require('path');
const cwd = process.cwd();

function handler(_) {
  console.log('Setting up database...');
  const config = require(`${cwd}/config/database.json`);

  // XXX properly set environemnt
  const { client, database, username } = config.development;
  let stdout, stderr;

  switch (client) {
  case 'sqlite3':
    ({ stdout, stderr } = exec('sqlite3 db/development.sqlite3 < db/tasks.sql', { cwd }));
    break;
  case 'pg':
    ({ stdout, stderr } = exec(`psql ${database} ${username}`, { cwd }));
    break;
  }

  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
}

module.exports = {
  command: 'setup',
  builder: {},
  handler
};
