// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const rsyncwrapper = require('rsyncwrapper');
const config = require('config');
const { bold, underline, green, magenta } = require('chalk');

const VERSION = require('../../package.json').version;

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
      `${bold.blue('Kretes:')} ${underline(VERSION)} ${green('rsync')} - deploying ${magenta(
        'server'
      )} ...`
    );
    await rsync(server, showCommand);

    console.log(
      `${bold.blue('Kretes:')} ${underline(VERSION)} ${green('rsync')} - deploying ${magenta(
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
