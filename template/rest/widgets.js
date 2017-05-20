const { ok, created } = require('huncwot/response');

function browse(request) {
  return ok([
    { name: 'Widget 1' },
    { name: 'Widget 2' },
  ]);
}

function read(request) {
  return ok({ name: 'Widget 1' })
}

function edit(request) {
  const { id, name } = request.params;

  return ok({ status: `success: ${id} changed to ${name}` });
}

function add(request) {
  const { name } = request.params;

  return created({ status: `success: ${name} created` })
}

function destroy(request) {
  const { id } = request.params;

  return ok({ status: `success: ${id} destroyed` })
}

module.exports = { browse, read, edit, add, destroy }
