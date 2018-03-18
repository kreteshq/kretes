# [Huncwot](https://huncwot.org) (pre-alpha)


[![Subscribe](https://img.shields.io/badge/%20huncwot%20-%20newsletter%20-blue.svg)](https://landing.mailerlite.com/webforms/landing/a3k0m1)
[![npm](https://img.shields.io/npm/v/huncwot.svg)](https://www.npmjs.com/package/huncwot)
[![npm](https://img.shields.io/npm/dm/huncwot.svg)](https://www.npmjs.com/package/huncwot)

Huncwot is a fast, opinionated and minimal Node.js web framework built for ES6/7 era with « batteries included » approach. It exclusively supports Node 7.6+ to avoid a transpilation pipeline of any kind. It is an **integrated** solution that optimizes for programmers productivity by reducing choices and incorporating community conventions.

[Website](https://huncwot.org) |
[Contribution Guide](CONTRIBUTING.md) |
[Twitter](http://twitter.com/huncwot)

## Table of Contents

* [In a nutshell](#in-a-nutshell)
* [Hello Huncwot](#hello-huncwot)
* [Rationale](#rationale)
* [Getting Started](#getting-started)
* [Usage](#usage)
  * [Server-Side](#server-side)
  * [Component-based](#component-based)
* [Concepts](#concepts)
  * [Database](#databse)
  * [Controller](#controllers)
  * [View](#view)
  * [Routes](#routes)
  * [Parameters](#parameters)
  * [GraphQL](#graphql)
* [Modules](#modules)
  * [Auth](#auth)
  * [Static](#static)
* [Examples](#examples)


## In a nutshell

* it uses [Marko](http://markojs.com/) for managing pages (entirely server-side generated) & components (server- & client-side generated)
* in the view layer it supports both HTML and indentation-based syntax à la Jade/Pug (thanks to Marko)
* it uses [MobX](https://mobx.js.org/) for state management
* it uses [Knex](http://knexjs.org/) for the database integration which provides a SQL-like abstraction instead of an ORM of any sort
* it provides a simpler abstraction (inspired by Clojure's [ring](https://github.com/ring-clojure/ring) web library) than Express/Koa for server-side content
* it provides [GraphQL](http://graphql.org/) integration out of the box using [Apollo](https://github.com/apollographql/apollo-server) to collocate queries with components

## Hello Huncwot

This is an example of a basic Huncwot application. Save it to a file e.g. `server.js`, run it with `node server.js` and visit the application `https://localhost:5544`.

> *Note* Don't forget to install `huncwot` by adding it to `package.json` in your project directory followed by `npm install`. If you're starting from scratch, use `npm init` or (better) `huncwot new` described below.

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

```marko
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

### Database

An ORM is at times too much to get data out of the database. Huncwot provides an thin layer of integration with various RDMBS systems using [Knex.js](https://github.com/tgriesser/knex). Thanks to this library you can write usual SQL queries, yet fully integrated with the regular JavaScript data structures.

The database configuration is stored `config/database.json` as a JSON document.

In order to start using the database integration you only need to require `huncwot/db`:

```
const db = require('huncwot/db');
```

Let's see how we can perform some basic and frequent SQL queries in Huncwot

#### Select

Get all elements with all columns from `widgets` table; equivalent to `select * from widgets`:

```
const results = await db('widgets');
```

Get all elements with all some columns from `widgets` table; equivalent to `select id, name from widgets`:

```
const results = await db('widgets').select('id', 'name');
```

Get a single element from `widgets` table by `id`:

```
const result = await db('widgets').where({ id })
```

#### Insert/Update

Insert a single element into `widgets` table:

```
await db('widgets').insert({ name: 'Widget 1', amount: 2 })
```

Insert few elements at once into `widgets` table:

```
await db('widgets').insert([
  { name: 'Widget 1', amount: 2 },
  { name: 'Widget 2', amount: 7 },
  { name: 'Widget 3', amount: 4 }
])
```

Update an existing element (identified by `id`) in `widgets` table:

```
await db('widgets').where({ id: 2 }).update({ name: 'Widget 22' })
```

### Controllers

A controller is a module which groups actions. Actions are functions operating in the context of a single route, i.e. `controllers/widgets/*.js` handle HTTP actions for `/widgets` route.

Each action defined in a controller is responsible to connect the information received from the incoming request to underlaying data in your application (i.e. fetching/saving/updating) in order to produce a corresponding view e.g. a HTML page or a JSON payload.

Controllers may define up to five action. Each action is placed in a separate file i.e. `browse`, `read`, `edit`, `add`, `delete` - in short **BREAD** (which is a kind of extension of CRUD approach). Each of those functions is triggered by a corresponding HTTP method i.e. `browse()` and `read()` by `GET`, `edit()` by `PUT`, `add()` by `POST` and finally `destroy()` by `DELETE`.

Here's an example of a controller with five actions defined in `controllers/widgets/` directory.

`controllers/widgets/browse.js`:

```js
const { ok } = require('huncwot/response');

async function browse(request) {
  const results = ...
  return ok(results);
}

module.exports = browse
```

`controllers/widgets/read.js`

```js
const { ok } = require('huncwot/response');

async function read(request) {
  const { id } = request.params;
  const result = ...
  return ok(result);
}

module.exports = read
```

`controllers/widgets/edit.js`:

```js
const { ok } = require('huncwot/response');

async function edit(request) {
  const { id, name } = request.params;
  ...
  return ok({ status: `success: ${id} changed to ${name}` });
}

module.exports = edit
```

`controllers/widgets/add.js`:

```js
const { created } = require('huncwot/response');

async function add(request) {
  const { name } = request.params;
  ...
  return created({ status: `success: ${name} created` });
}

module.exports = add
```

`controllers/widgets/destroy.js`:

```js
const { ok } = require('huncwot/response');

async function destroy(request) {
  const { id } = request.params;
  ...
  return ok({ status: `success: ${id} destroyed` });
}

module.exports = destroy
```

By default, Huncwot will make those actions available under `/widgets` route through HTTP methods and in accordance to **BREAD** principle.

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

```marko
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

### GraphQL

Huncwot uses [Apollo](http://dev.apollodata.com/) on the client and on the server. Type definitions are stored at the top level in `schema.js`. Resolvers are placed in `resolvers/` directory. Both schema and resolvers are auto-generated with placeholder data using `huncwot new`. GraphQL service endpoint is `/graphql`.

Here's an example of a component with a collocated GraphQL query that communicates with the built-in `/graphql` endpoint.

```marko
import gql from 'graphql-tag';
import client from 'services/graphql';

static {
  const query = gql`
    query WidgetsQuery {
      widgets {
        id
        name
      }
    }
  `;
}

class {
  onCreate() {
    this.state = { widgets: [] }
  }

  onMount() {
    client.query({ query })
      .then(({ data }) => {
        this.state.widgets = data.widgets;
      })
  }
}

style {}

<ul>
  <li for (widget in state.widgets)>${widget.name} - ID: ${widget.id}</li>
</ul>
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

* [counter](https://github.com/zaiste/huncwot/tree/master/examples/counter)
  ([demo](https://huncwot.org))

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
* [huncwot-todo-graphql](https://github.com/zaiste/huncwot-todo-graphql) a simple task manager built with Huncwot and using GraphQL
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
