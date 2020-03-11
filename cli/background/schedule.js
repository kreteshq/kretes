// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars

const config = require('config');
const { Client } = require('pg');

const handler = async ({ task, payload = '{}', options = {} }) => {
  const connection = config.get('db');
  const db = new Client(connection);

  await db.connect();
  await db.query(
    `
    select * from graphile_worker.add_job(
        identifier => $1::text,
        payload => $2::json,
        queue_name => coalesce($3::text, public.gen_random_uuid()::text),
        run_at => coalesce($4::timestamptz, now()),
        max_attempts => coalesce($5::int, 25)
    );`,
    [
      task,
      payload,
      options.queueName || null,
      options.runAt ? options.runAt.toISOString() : null,
      options.maxAttempts || null
    ]
  );
  await db.end();
};

module.exports = {
  command: 'schedule <task> [payload]',
  builder: _ => _,
  handler
};
