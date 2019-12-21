const db = require('./db.js');

module.exports = {
  async schedule({ task, payload = {}, queue = null, runAt = null, maxAttempts = null }) {
    await db.sql`
    SELECT * FROM graphile_worker.add_job(
      identifier => ${task.name}::text,
      payload => ${payload}::json,
      queue_name => coalesce(${queue}::text, public.gen_random_uuid()::text),
      run_at => coalesce(${runAt ? runAt.toISOString() : null}::timestamptz, now()),
      max_attempts => coalesce(${maxAttempts}::int, 25)
    );`;
  }
};
