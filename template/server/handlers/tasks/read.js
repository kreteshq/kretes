const { ok } = require('huncwot/response');
const db = require('huncwot/db');

async function read(request) {
  const { id } = request.params;

  const result = await db('tasks').where({ id });
  return ok(result);
}

module.exports = { read };
