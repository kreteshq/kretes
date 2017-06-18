const { ok, created } = require('huncwot/response');
const db = require('huncwot/db');

async function browse(request) {
  const results = await db.any('select * from widgets');

  return ok(results);
}

async function read(request) {
  const { id } = request.params;

  const result = await db.one('select * from widgets where id = $1', id)
  return ok(result);
}

async function edit(request) {
  const { id, name } = request.params;

  await db.none('update widgets set name=$1 where id=$2', [name, parseInt(id)])

  return ok({ status: `success: ${id} changed to ${name}` });
}

async function add(request) {
  const { name } = request.params;

  await db.none('insert into widgets(name) values(${name})', { name })

  return created({ status: `success: ${name} created` })
}

async function destroy(request) {
  const { id } = request.params;

  await db.result('delete from widgets where id = $1', id)

  return ok({ status: `success: ${id} destroyed` })
}

module.exports = { browse, read, edit, add, destroy }
