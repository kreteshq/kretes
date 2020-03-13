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

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const rsyncwrapper = require('rsyncwrapper');
const config = require('config');
const { bold, underline, green, magenta } = require('chalk');

const VERSION = require('../package.json').version;

const rsync = async (options, showCommand = false) => {
  return new Promise((resolve, reject) => {
    rsyncwrapper(
      { ...options, recursive: true, ssh: true, args: ['-azP'] },
      (error, stdout, stderr, cmd) => {
        if (showCommand) console.log(cmd);

        if (error) {
          reject(error);
        }

        resolve(stdout);
      }
    );
  });
};

const deploy = async ({ showCommand }) => {
  const { server, client } = config.get('deploy');
  try {
    console.log(
      `${bold.blue('Huncwot:')} ${underline(VERSION)} ${green('rsync')} - deploying ${magenta(
        'server'
      )} ...`
    );
    await rsync(server, showCommand);

    console.log(
      `${bold.blue('Huncwot:')} ${underline(VERSION)} ${green('rsync')} - deploying ${magenta(
        'client'
      )} ...`
    );
    await rsync(client, showCommand);
  } catch (error) {
    switch (error.message) {
      case 'rsync exited with code 3':
        console.log(
          '[rsync] Errors selecting input/output files, dirs: Probably these files/dirs don\'t exist'
        );
        break;
      default:
        console.log('[rsync] Unknown Error');
        break;
    }
  }
};

module.exports = {
  builder: _ => _.option('showCommand', { default: false }),
  handler: deploy
};
