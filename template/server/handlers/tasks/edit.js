const { ok } = require('huncwot/response');
const db = require('huncwot/db');

async function edit(request) {
  const { id, name } = request.params;

  await db('tasks').where({ id }).update({ name });

  return ok({ status: `success: ${id} changed to ${name}` });
}

module.exports = edit;
