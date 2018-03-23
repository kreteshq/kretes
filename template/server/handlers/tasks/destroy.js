const { ok } = require('huncwot/response');
const db = require('huncwot/db');

async function destroy(request) {
  const { id } = request.params;

  await db('tasks').where({ id }).del();

  return ok({ status: `success: ${id} destroyed` });
}

module.exports = destroy;
