// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars

const config = require('config');
const { Pool } = require('pg');
const { run } = require('graphile-worker');

const handler = async () => {
  const CWD = process.cwd();
  const connection = config.get('db');
  const pgPool = new Pool(connection);

  const _runner = await run({
    pgPool,
    taskDirectory: `${CWD}/dist/tasks`
  });
};

module.exports = { builder: _ => _, handler };
