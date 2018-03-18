const { ok } = require('huncwot/response');
const db = require('huncwot/db');

async function browse(request) {
  const results = await db('tasks');

  return ok(results);
}

module.exports = browse;
