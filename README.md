# [Huncwot](https://huncwot.org) (pre-alpha)


[![Subscribe](https://img.shields.io/badge/%20huncwot%20-%20newsletter%20-blue.svg)](https://landing.mailerlite.com/webforms/landing/a3k0m1)
[![npm](https://img.shields.io/npm/v/huncwot.svg)](https://www.npmjs.com/package/huncwot)
[![npm](https://img.shields.io/npm/dm/huncwot.svg)](https://www.npmjs.com/package/huncwot)

Huncwot is a fast, opinionated and minimal Node.js web framework built for ES6/7 era with « batteries included » approach. It exclusively supports Node 7.6+ to avoid a transpilation pipeline of any kind. It is an **integrated** solution that optimizes for programmers productivity by reducing choices and incorporating community conventions.

[Website](https://huncwot.org) |
[Contribution Guide](CONTRIBUTING.md) |
[Twitter](http://twitter.com/huncwot)

## Getting Started 

You can define a route using one of HTTP verbs e.g. `.get()`, `.post()`, `.put()`, `.patch()` or `.delete()` - it takes a string which defines a desired path and a function that defines a action which will be exectued once the route is hit. The action takes the incoming `request` as its parameter and returns a `response` that will be send to the client. The response is represented as a JavaScript object which must have at least `body` and `statusCode` keys. By conventions, a return of string value is considered to be a `200` response of type `plain/text` with `body` set to that string. There is also a `reply` helper function which allows to create responses with `application/json` type out of JavaScript objects.

```js
const Huncwot = require('huncwot');
const { reply } = require('huncwot/helpers');

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

## Rationale

Huncwot is being built with *battery included* approach in mind, i.e. it comes with a (eventually large) library of useful modules which are developped in a coherent way. This stands in direct opposition to Koa approach. Huncwot tries to formalize conventions and eliminate valueless choices by providing solid defaults for building web applications that increase the programmers productivity.

## Usage

### Parameters

There are two kinds of parameters possible in a web application: the ones that are sent as part of the URL after `?`, called *query string* parameters; and the ones that are sent as part of the request `body`, referred to as POST data (usually comes from an HTML form or as JSON). Huncwot does not make any distinction between query string parameters and POST parameters, both are available in the request `params` object. 

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
