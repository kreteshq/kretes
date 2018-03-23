const Huncwot = require('huncwot');
const { ok } = require('huncwot/response');

const app = new Huncwot();

// implicit `return` with a `text/plain` response
app.get('/hello', _ => 'Hello Huncwot');

// explicit `return` with a 200 response of `application/json` type
app.get('/json', _ => {
  return ok({ a: 1, b: 2 });
});

// set your own headers
app.get('/headers', _ => {
  return { body: 'Hello B', statusCode: 201, headers: { 'Authorization': 'PASS' } };
});

// request body is parsed in `params` by default
app.post('/bim', request => {
  return `Hello POST! ${request.params.name}`;
});

app.listen(5544);
