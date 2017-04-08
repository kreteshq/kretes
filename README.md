# huncwot

Fast, opinionated and minimal Node.js web framework built for ES6/7 era with « batteries included » approach.

`huncwot` exclusively supports Node 7.6+ to avoid a transpilation pipeline of any
kind...

## Usage

```js
const Huncwot = require('huncwot');

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
```
