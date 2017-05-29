# [Huncwot](https://huncwot.org) (pre-alpha)


[![Subscribe](https://img.shields.io/badge/%20huncwot%20-%20newsletter%20-blue.svg)](https://landing.mailerlite.com/webforms/landing/a3k0m1)
[![npm](https://img.shields.io/npm/v/huncwot.svg)](https://www.npmjs.com/package/huncwot)
[![npm](https://img.shields.io/npm/dm/huncwot.svg)](https://www.npmjs.com/package/huncwot)

Huncwot is a fast, opinionated and minimal Node.js web framework built for ES6/7 era with « batteries included » approach. It exclusively supports Node 7.6+ to avoid a transpilation pipeline of any kind. It is an **integrated** solution that optimizes for programmers productivity by reducing choices and incorporating community conventions.

[Website](https://huncwot.org) |
[Contribution Guide](CONTRIBUTING.md) |
[Twitter](http://twitter.com/huncwot)

## Hello Huncwot

This is an example of a basic Huncwot application. Save it to a file e.g. `main.js`, run it with `node main.js` and visit the application `https://localhost:5544`.

```js
const Huncwot = require('huncwot');
const { ok } = require('huncwot/response');

const app = new Huncwot();

// implicit `return` with a `text/plain` response
app.get('/', _ => 'Hello Huncwot')

// explicit `return` with a 200 response of `application/json` type
app.get('/json', _ => {
  return ok({ a: 1, b: 2 });
})

// set your own headers
app.get('/headers', _ => {
  return { body: 'Hello B', statusCode: 201, headers: { 'Authorization': 'PASS' } }
})

// request body is parsed in `params` by default
app.post('/bim', request => {
  return `Hello POST! ${request.params.name}`;
})

app.listen(5544);
```

This example shows a regular, server-side application in the style of Express or Koa, e.g. you define various routes as a combination of paths and functions attached to it i.e. route handlers. In contrast to Express, Huncwot handlers only take HTTP `request` as input and always return an HTTP response: either defined explicitly as an object with `body`, `status`, etc keys, or implicitly with an inferred type e.g. `text/plain` or as a wrapping function e.g. `ok()` for `200`, or `created()` for `201`.

## Rationale

Huncwot is being built with *battery included* approach in mind, i.e. it comes with a (eventually large) library of useful modules which are developped in a coherent way. This stands in direct opposition to Koa approach. Huncwot tries to formalize conventions and eliminate valueless choices by providing solid defaults for building web applications that increase the programmers productivity.

## Getting Started 

Install `huncwot` globally to use its CLI commands which simplify frequent operations. You also need to install [yarn](https://yarnpkg.com/en/).

```
yarn global add huncwot
```

Generate new application 

```
huncwot new my-project 
cd my-project
```

Start the application using built-in development server

```
huncwot server
```

Visit `https://localhost:5544`

## Usage

Huncwot can be used as a replacement for Express or Koa, but it also goes beyond that by providing opinionated choices to other layers in the stack (view, ORM, etc) required to build a fully functional web application. 

There are two essential ways in Huncwot to constract a web application: traditional server-side or modern component-based. Nonenthless, those two approaches can be combined in any proportion.

### Server-side

Server-side means that the application content is generated on the server. We usually think here in terms of *pages* available at particular paths. Routing is also performed on the server with paths corresponding to pages. 

![page](https://raw.githubusercontent.com/zaiste/huncwot/master/docs/page-approach.png)

Here's a server-side example of a Huncwot application. 

```js
const Huncwot = require('huncwot');
const { page, gzip } = require('huncwot/view');

const app = new Huncwot();

app.get('/', request => gzip(page('index', { name: 'Frank' })))

app.listen(5544);
```

### Component-based

Component-based means that *pages* are built by combining components: an independant chunks of HTML with their own styling and behaviour defined in JavaScript. There is usually only a single *page* (rendered on the server) to which components are being attached - this happens in the browser (client-side). Routing is usually performed in the browser with paths corresponding to components. 

![component](https://raw.githubusercontent.com/zaiste/huncwot/master/docs/component-approach.png)


Here's a component example

```js
class {
  onCreate() {
    this.state = { count:0 };
  }
  increment() {
    this.state.count++;
  }
}

style {
  .count {
    font-size:3em;
  }
  .example-button {
    font-size:1em;
    padding:0.5em;
  }
}

<h1 class="title">Here be dragons!</h1>
<h2 class="subtitle">
  Experience Huncwot magic and carefully follow the instruction.
</h2>

<div.count>
  <p class="title count">${state.count}</p>
</div>
<button.is-danger.button.is-outlined on-click('increment')>
  Click me!
</button>
```

## Concepts 

### View

Huncwot uses [Marko][1] in the view layer to handle both server-side template generation and browser, component-based approach. 

```js
const Huncwot = require('huncwot');
const { page, gzip } = require('huncwot/view');

const app = new Huncwot();

app.get('/', request => gzip(page('index', { name: 'Frank' })))

app.listen(5544);
```

Huncwot provides helper functions to simplify usual operations in the request/response cycle. There is `gzip` which compresses the response along with setting the proper headers, or `page` function which checks `pages/` directory for Marko templates. Before running the example, be sure to have `pages/` directory in the root of your project along with the following `index.marko`

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

### Routes 

You can define a route using one of HTTP verbs e.g. `.get()`, `.post()`, `.put()`, `.patch()` or `.delete()` - it takes a string which defines a desired path and a function that defines a action which will be exectued once the route is hit. The action takes the incoming `request` as its parameter and returns a `response` that will be send to the client. The response is represented as a JavaScript object which must have at least `body` and `statusCode` keys. By conventions, a return of string value is considered to be a `200` response of type `plain/text` with `body` set to that string. There is also a `reply` helper function which allows to create responses with `application/json` type out of JavaScript objects.

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

## 3-rd Party Integrations

### [nunjucks](https://mozilla.github.io/nunjucks/) integration

```js
const Huncwot = require('huncwot');
const { html } = require('huncwot/response');
const nunjucks = require('nunjucks');

const app = new Huncwot();

nunjucks.configure('views', { autoescape: true });

app.get('/', request => {
  return html(nunjucks.render('index.html', { username: 'Zaiste' }));
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

## Examples

* [huncwot-component-app](https://github.com/zaiste/huncwot-component-app) a basic Huncwot application using components 
* [huncwot-server-app](https://github.com/zaiste/huncwot-server-app) a basic server-side Huncwot application 
* [huncwot-rest-api](https://github.com/zaiste/huncwot-rest-api) a REST API built with Huncwot 
* [huncwot-graphql-api](https://github.com/zaiste/huncwot-graphql) a GraphQL API built with Huncwot 

## Roadmap

Huncwot keeps track of the upcoming fixes and features on GitHub Projects: [Huncwot Roadmap](https://github.com/zaiste/huncwot/projects/1)

## Bug reports

We use *Github Issues* for managing bug reports and feature requests. If you run
into problems, please search the *issues* or submit a new one here:
https://github.com/zaiste/huncwot/issues

Detailed bug reports are always great; it's event better if you are able to
include test cases.

[1]: http://markojs.com/
