const Huncwot = require('../lib/index');

const app = new Huncwot();

// implicit `return`
app.get('/', _ => 'Hello Huncwot')

// explicit `return` for `application/json`
app.get('/json', _ => {
  return { a: 1, b: 2 };
})

// explicit assignment to `context.body` to set response body
app.post('/bim', context => {
  context.body = `Hello POST! ${context.params.name}`;
})

app.listen(3000);
