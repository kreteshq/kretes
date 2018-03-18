const { created } = require('huncwot/response');
const db = require('huncwot/db');

async function add(request) {
  const { name } = request.params;

  await db('tasks').insert({ name });

  return created({ status: `success: ${name} created` });
}

module.exports = add;
