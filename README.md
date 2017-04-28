# [Huncwot](https://huncwot.org) (pre-alpha)


[![Subscribe](https://img.shields.io/badge/%20huncwot%20-%20newsletter%20-blue.svg)](https://landing.mailerlite.com/webforms/landing/a3k0m1)
[![npm](https://img.shields.io/npm/v/huncwot.svg)](https://www.npmjs.com/package/huncwot)
[![npm](https://img.shields.io/npm/dm/huncwot.svg)](https://www.npmjs.com/package/huncwot)

Huncwot is a fast, opinionated and minimal Node.js web framework built for ES6/7 era with « batteries included » approach. It exclusively supports Node 7.6+ to avoid a transpilation pipeline of any kind...

[Website](https://huncwot.org) |
[Contribution Guide](CONTRIBUTING.md) |
[Twitter](http://twitter.com/huncwot)

## Getting Started 

```js
const Huncwot = require('huncwot');
const { reply, render } = require('huncwot/lib/helpers');

const app = new Huncwot();

// implicit `return`
app.get('/', _ => 'Hello Huncwot')

// explicit `return` for `application/json`
app.get('/json', _ => {
  return reply({ a: 1, b: 2 });
})

// set headers
app.get('/headers', _ => {
  return { body: 'Hello B', statusCode: 201, headers: { 'Authorization': 'PASS' } }
})

// parsing request body 
app.post('/bim', request => {
  return `Hello POST! ${request.params.name}`;
})

app.listen(3000);
```

## Modules

Huncwot comes with a set of modules that enable common functionalities

### Auth

```js
app.use(auth({ users: { 'admin': 'secret' }}))
```

### Static

```js
app.use(static('./public'))
```

## Examples

### [nunjucks](https://mozilla.github.io/nunjucks/) integration

```js
const Huncwot = require('huncwot');
const { reply } = require('huncwot/helpers');
const nunjucks = require('nunjucks');

const app = new Huncwot();

nunjucks.configure('views', { autoescape: true });

app.get('/', request => {
  return reply(nunjucks.render('index.html', { username: 'Zaiste' }));
})

app.listen(3000);
```

In your project create `views/` directory with the following `index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Nunjucks Example</title>
</head>
<body>
  <h1>Hello {{ username }}</h1>
</body>
</html>
```

### [marko](http://markojs.com) integration

```js
const Huncwot = require('huncwot');
const { reply } = require('huncwot/helpers');

require('marko/node-require');

const app = new Huncwot();

const template = require('./views/index.marko');

app.get('/', request => {
  return template.stream({ name: 'Zaiste' })
})

app.listen(3000);
```

In your project create `views/` directory with the following `index.marko`

```html
<!doctype html>
<html>
<head>
  <title>Marko Example</title>
</head>
<body>
  <h1>Hello ${input.name}</h1>
</body>
</html>
```

## Roadmap

Huncwot keeps track of the upcoming fixes and features on GitHub Projects: [Huncwot Roadmap](https://github.com/zaiste/huncwot/projects/1)

## Bug reports

We use *Github Issues* for managing bug reports and feature requests. If you run
into problems, please search the *issues* or submit a new one here:
https://github.com/zaiste/huncwot/issues

Detailed bug reports are always great; it's event better if you are able to
include test cases.
