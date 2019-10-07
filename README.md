<p align="center">
  <img width="250" src="/docs/huncwot-logo.svg">
</p>

<h1 align="center">
  <a href="https://huncwot.org">Huncwot</a>
</h1>

<p align="center">
  <b>Macro framework for monolithic JavaScript applications, batteries included</b>
</p>

<br>

<p align="center">
  <a href="https://landing.mailerlite.com/webforms/landing/a3k0m1"><img src="https://img.shields.io/badge/%20newsletter%20-%20subscribe%20-blue.svg?style=for-the-badge" alt="Subscribe to Huncwot Newsletter"></a>
  <a href="https://www.npmjs.com/package/huncwot"><img src="https://img.shields.io/npm/v/huncwot.svg?style=for-the-badge" alt="Huncwot Package on NPM"></a>
  <a href="https://www.npmjs.com/package/huncwot"><img src="https://img.shields.io/npm/dm/huncwot.svg?style=for-the-badge" alt="Huncwot Package on NPM"></a>
  <a href="https://discord.gg/fdqx3BD"><img src="https://img.shields.io/badge/Discord-join%20chat-738bd7.svg?style=for-the-badge" Alt="Huncwot channel on Discord"></a>
</a>

Huncwot is a **macro framework** for **monolithic** web applications built for modern JavaScript with « batteries included » approach. It is an **integrated** solution that optimizes for programmers productivity by reducing choices and incorporating community conventions.

[Website](https://huncwot.org) |
[Twitter](http://twitter.com/huncwot)

> The documentation is a bit outdated. Check the [Huncwot Example App](https://github.com/zaiste/huncwot-example-app) for inspiration and guidance.

## Table of Contents

* [Features In A Nutshell](#features-in-a-nutshell)
* [Rationale](#rationale)
* [Getting Started](#getting-started)
* [Usage](#usage)
  * [Server-Side](#server-side)
  * [Component-based](#component-based)
* [Concepts](#concepts)
  * [Database](#databse)
  * [Handlers](#handlers)
  * [View](#view)
  * [Routes](#routes)
  * [Parameters](#parameters)
  * [GraphQL](#graphql)
* [Modules](#modules)
  * [Auth](#auth)
  * [Static](#static)
* [Examples](#examples)


## Features In A Nutshell

Huncwot bridges client-side (*frontend*) and server-side (*backend*) development
by using [a single programming language - JavaScript - across the
board](https://cdb.reacttraining.com/universal-javascript-4761051b7ae9).

The framework draws inspiration from Rails while trying to be less *magical*, if
any at all. In Huncwot, you write your applications using
[TypeScript](https://www.typescriptlang.org/). It also comes with a convenient
command toolkit (CLI) which wraps over `npm scripts`

As a secondary goal, Huncwot tries to minimize the dependencies. It uses
external packages only if absolutely necessary (e.g. security, OS abstractions
etc).

### :gear: Server-side / Backend

* Huncwot is as a replacement for Express & Koa to build server-side applications.
* Huncwot provides a simpler than Express/Koa, data-driven HTTP handler abstraction.
* Huncwot comes with a built-in REST endpoint.
* Huncwot comes with a built-in GraphQL endpoint. 
* Huncwot can collocate [GraphQL](http://graphql.org/) queries with Vue.js components.
* Huncwot provides a data-driven router

### :bar_chart: Client-side / Frontend

* ... uses [Vue.js](https://vuejs.org/)
* ... uses [Vuex](https://vuex.vuejs.org/en/) for state management
* ... uses [Webpack 4](https://webpack.js.org/) for bundling assets
* ... favors class-style Vue.js components using [vue-class-component](https://github.com/vuejs/vue-class-component)
* ... can be used as a convenient boilerplate for Vue.js to build client-side applications
* ... uses [vue-i18n](https://github.com/kazupon/vue-i18n) for internationalization

### :closed_lock_with_key: Security

* Huncwot favors [Argon2](https://en.wikipedia.org/wiki/Argon2) as a hash
  function for storing passwords over bcrypt and scrypt. bcrypt lacks memory
  hardness while in scrypt both, memory hardness and iteration count are tied to
  a single cost factor. On top of that, Argon2 won the Password Hashing
  Competition in 2015. It is build around AES ciphers, is resistant to ranking
  tradeoff attacks and more...
* Huncwot uses the [node-argon2](https://github.com/ranisalt/node-argon2/) package 

### :computer: Command Toolkit

### :minidisc: Storage

* Huncwot favors plain (old?) SQL queries over ORMs as [SQL is one of the most valuable skills](http://www.craigkerstiens.com/2019/02/12/sql-most-valuable-skill/)
* Huncwot provides a SQL-like, data-driven abstractions for the database integration
* ... uses [Sqorn](https://sqorn.org/) for the database integration which provides a SQL-like abstractions right inside JavaScript
* ... supports only PostgreSQL
* ... is unwilling to support NoSQL ([Thank you for your help NoSQL, but we got it from here](https://www.memsql.com/blog/why-nosql-databases-wrong-tool-for-modern-application/))

### :cake: Conventions & Conveniences

* Huncwot enforces the [Folder-By-Feature Directory Structure](#folder-by-feature-directory-structure)

## Rationale

Huncwot is being built with *battery included* approach in mind, i.e. it comes with a (eventually large) library of useful modules which are developped in a coherent way. This stands in direct opposition to Koa approach. Huncwot tries to formalize conventions and eliminate valueless choices by providing solid defaults for building web applications that increase the programmers productivity.

## Getting Started

Install `huncwot` globally to use its CLI commands which simplify frequent operations. You also need to install [yarn](https://yarnpkg.com/en/).

```
npm install -g huncwot
```

Generate new application

```
huncwot new my-project
cd my-project
```

Start the application using `huncwot`, `hc` (alias) or `npm`

```
huncwot start
```

or

```
hc start
```

or

```
npm start
```

Visit `https://localhost:8080`

![Huncwot Init](https://raw.githubusercontent.com/zaiste/huncwot/master/docs/huncwot-start.png)

## Features In Detail

### Folder-By-Feature Directory Structure

The directory structure in Huncwot is organized around your application
**features**, and not **by type**. This means that artifacts, either client-side or
server-side are kept togheter. In other words, this approach groups together
entities (classes, functions) that actually work together. This leads to high
modularity of your application and better cohesion.

The *Folder-By-Feature* approach makes it easier to find files in your
application directory. It is especially visible once your project grows -
folder-by-feature is a better long-term approach due its scalability.

To some extend, the *Folder-By-Feature* approach is similar to how recent
frontend libraries and frameworks (React, Vue, etc) group together HTML,
JavaScript and Stylesheets. In Huncwot, this simply goes one step further by
applying a similar technique to the entire application so that it covers both
frontend and backend.


## Usage

Huncwot can be used as a replacement for Express or Koa, but it also goes beyond that by providing opinionated choices to other layers in the stack (view, ORM, etc) required to build a fully functional web application.

There are two essential ways in Huncwot to constract a web application: traditional server-side or modern component-based. Nonenthless, those two approaches can be combined in any proportion.

### Server-side

This is an example of a basic server-side application in Huncwot. Save it to a file e.g. `server.js`, run it with `node server.js` and visit the application `https://localhost:5544`.

> *Note* Don't forget to install `huncwot` by adding it to `package.json` in your project directory followed by `npm install`. If you're starting from scratch, use `npm init` or (better) `huncwot new` described below.

```js
const Huncwot = require('huncwot');
const { OK } = require('huncwot/response');

const app = new Huncwot();

// implicit `return` with a `text/plain` response
app.get('/', _ => 'Hello Huncwot')

// explicit `return` with a 200 response of `application/json` type
app.get('/json', _ => {
  return OK({ a: 1, b: 2 });
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

This example shows a regular, server-side application in the style of Express or Koa, e.g. you define various routes as a combination of paths and functions attached to it i.e. route handlers. In contrast to Express, Huncwot handlers only take HTTP `request` as input and always return an HTTP response: either defined explicitly as an object with `body`, `status`, etc keys, or implicitly with an inferred type e.g. `text/plain` or as a wrapping function e.g. `OK()` for `200`, or `created()` for `201`.


### Component-based

Component-based means that *pages* are built by combining components: an independant chunks of HTML with their own styling and behaviour defined in JavaScript. There is usually only a single *page* (rendered on the server) to which components are being attached - this happens in the browser (client-side). Routing is usually performed in the browser with paths corresponding to components.

![component](https://raw.githubusercontent.com/zaiste/huncwot/master/docs/component-approach.png)


Here's an example of a Vue.js component

```js
<template>
  <div class="content">
    <h2>Counter</h2>

    <div>
      <span class="counter">{{ $store.state.count }}</span>
      <span class="notice">(count is: {{ evenOrOdd }})</span>
    </div>

    <a @click="increment">Increment</a>
    <a @click="decrement">Decrement</a>
    <a @click="incrementIfOdd">Increment if odd</a>
    <a @click="incrementAsync">Increment async</a>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters([
    'evenOrOdd'
  ]),
  methods: mapActions([
    'increment',
    'decrement',
    'incrementIfOdd',
    'incrementAsync'
  ])
}
</script>

<style scoped>
.counter {
  font-size: 5rem;
}

.notice {
  color: #666;
  font-weight: 500;
}
</style>
```

## Concepts

### Database

An ORM is at times too much to get data out of the database. Huncwot provides an
thin layer of integration with various RDMBS systems using
[Sqorn](https://sqorn.org/). Thanks to this library you can
write usual SQL queries, yet fully integrated with the regular JavaScript data
structures.

The database configuration is stored `config/database.json` as a JSON document.

In order to start using the database integration you only need to require `huncwot/db`:

```
const db = require('huncwot/db');
```

Let's see how we can perform some basic and frequent SQL queries in Huncwot

#### Select

Get all elements with all columns from `widgets` table; equivalent to `select * from widgets`:

```
const results = await db`widgets`;
```

Get all elements with all some columns from `widgets` table; equivalent to `select id, name from widgets`:

```
const results = await db`widgets`.return('id', 'name');
```

Get a single element from `widgets` table by `id`:

```
const result = await db`widgets`.where({ id })
```

#### Insert/Update

Insert a single element into `widgets` table:

```
await db`widgets`.insert({ name: 'Widget 1', amount: 2 })
```

Insert few elements at once into `widgets` table:

```
await db`widgets`.insert([
  { name: 'Widget 1', amount: 2 },
  { name: 'Widget 2', amount: 7 },
  { name: 'Widget 3', amount: 4 }
])
```

Update an existing element (identified by `id`) in `widgets` table:

```
await db`widgets`.where({ id: 2 }).set({ name: 'Widget 22' })
```

### Handlers

A handler is a module which groups actions. Actions are functions operating in the context of a single route, i.e. actions defined in `handlers/widgets/` handle the `/widgets` route.

Each action defined in a handler is responsible to connect the information received from the incoming request to underlaying data in your application (i.e. fetching/saving/updating) in order to produce a corresponding view e.g. a HTML page or a JSON payload.

Handlers may define up to five action. Each action is placed in a separate file i.e. `browse`, `read`, `edit`, `add`, `delete` - in short **BREAD** (which is a kind of extension of CRUD approach). Each of those functions is triggered by a corresponding HTTP method i.e. `browse()` and `read()` by `GET`, `edit()` by `PUT`, `add()` by `POST` and finally `destroy()` by `DELETE`.

Here's an example of a handler with five actions defined in `handlers/widgets/` directory.

Inside `handlers/widgets/browse.js`:

```js
const { OK } = require('huncwot/response');

async function browse(request) {
  const results = ...
  return OK(results);
}

module.exports = browse
```

Inside `handlers/widgets/read.js`

```js
const { OK } = require('huncwot/response');

async function read(request) {
  const { id } = request.params;
  const result = ...
  return OK(result);
}

module.exports = read
```

Inside `handlers/widgets/edit.js`:

```js
const { OK } = require('huncwot/response');

async function edit(request) {
  const { id, name } = request.params;
  ...
  return OK({ status: `success: ${id} changed to ${name}` });
}

module.exports = edit
```

Inisde `handlers/widgets/add.js`:

```js
const { created } = require('huncwot/response');

async function add(request) {
  const { name } = request.params;
  ...
  return created({ status: `success: ${name} created` });
}

module.exports = add
```

Inside `handlers/widgets/destroy.js`:

```js
const { OK } = require('huncwot/response');

async function destroy(request) {
  const { id } = request.params;
  ...
  return OK({ status: `success: ${id} destroyed` });
}

module.exports = destroy
```

By default, Huncwot will make those actions available under `/widgets` route through HTTP methods and in accordance to **BREAD** principle.

### View

Huncwot uses [Vue.js](https://vuejs.org/) in the view layer to create and mangage components.

### Routes

You can define a route using one of HTTP verbs e.g. `.get()`, `.post()`, `.put()`, `.patch()` or `.delete()` - it takes a string which defines a desired path and a function that defines a action which will be exectued once the route is hit. The action takes the incoming `request` as its parameter and returns a `response` that will be send to the client. The response is represented as a JavaScript object which must have at least `body` and `statusCode` keys. By conventions, a return of string value is considered to be a `200` response of type `plain/text` with `body` set to that string. There is also a `reply` helper function which allows to create responses with `application/json` type out of JavaScript objects.

### Parameters

There are two kinds of parameters possible in a web application: the ones that are sent as part of the URL after `?`, called *query string* parameters; and the ones that are sent as part of the request `body`, referred to as POST data (usually comes from an HTML form or as JSON). Huncwot does not make any distinction between query string parameters and POST parameters, both are available in the request `params` object.

### GraphQL

Huncwot uses [Apollo](http://dev.apollodata.com/) on the client and on the server. Type definitions are stored at the top level in `graphql/`. Resolvers may be grouped in modules underneath `graphql/` directory. GraphQL service endpoint is `/graphql`.

Both schema and resolvers can be auto-generated with placeholder data using `demo` template of `huncwot new`:

```
huncwot new --template demo
```

Here's an example of a Vue.js component with a collocated GraphQL query that communicates with the built-in `/graphql` endpoint.

```js
<template>
  <div class="content">
    <h2>Widgets</h2>
    <ul>
      <li v-for="widget in widgets">{{ widget.name }}</li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const query = gql`
  query {
    widgets {
      name
    }
  }
`

export default {
  data() {
    return {
      widgets: []
    }
  },

  apollo: {
    widgets: {
      query
    }
  }
}
</script>
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

* [Huncwot Example App](https://github.com/zaiste/huncwot-example-app)
* [ToDo with Vue.js (Vuex, Vue Router), Node.js and TypeScript](https://github.com/zaiste/huncwot-component-app)

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

## Roadmap

Huncwot keeps track of the upcoming fixes and features on GitHub Projects: [Huncwot Roadmap](https://github.com/zaiste/huncwot/projects/1)

## Bug reports

We use *Github Issues* for managing bug reports and feature requests. If you run
into problems, please search the *issues* or submit a new one here:
https://github.com/zaiste/huncwot/issues

Detailed bug reports are always great; it's event better if you are able to
include test cases.

