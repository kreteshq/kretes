// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import db from './db';
import { ScheduleInput } from '.';

export const schedule = async ({ task, payload = {}, queue = null, runAt = null, maxAttempts = null }: ScheduleInput) => {
  await db.sql`
    SELECT * FROM graphile_worker.add_job(
      identifier => ${task.name}::text,
      payload => ${payload}::json,
      queue_name => coalesce(${queue}::text, public.gen_random_uuid()::text),
      run_at => coalesce(${runAt ? runAt.toISOString() : null}::timestamptz, now()),
      max_attempts => coalesce(${maxAttempts}::int, 25)
    );`;
}
