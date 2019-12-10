// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const { spawn } = require('child_process');

const migrate = async () => {
  spawn('npx', ['node-pg-migrate'], {
    stdio: 'inherit'
  });
};

module.exports = {
  builder: _ => _,
  handler: migrate
};
