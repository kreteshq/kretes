#!/usr/bin/env node

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

const argv = require('yargs')
  .version()
  .usage('Usage: huncwot <command> [options]')
  .command(['new [dir]', 'initialize', 'n'], 'Create new project', require('./cli/init'))
  .example('huncwot new my-project', 'Create and initialize `my-project` directory')
  .command(['server [dir]', 'serve', 's'], 'Serve the directory', require('./cli/server'))
  .example('huncwot server --port 4000', 'Serve the directory at the port 4000')
  .demandCommand(1, 'You need at least one command before moving on')
  .help('h')
  .alias('h', 'help')
  .epilogue('for more information, find the documentation at https://huncwot.net')
  .argv;
