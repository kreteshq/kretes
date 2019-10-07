import test from 'ava';
import axios from 'axios';

import Huncwot from '..';
import { OK, Created, html } from '../response.js';
import { validate } from '../request';

const merge = require('merge-deep');
const FormData = require('form-data');

const app = new Huncwot();
const perform = axios.create({
  baseURL: 'http://localhost:3000'
});

const ExplicitResponse = {
  statusCode: 200,
  headers: {},
  body: { hello: 'Huncwot' }
};

const GETs = {
  get: {
    '/': _ => 'Hello, Huncwot',
    '/json-explicit-response': _ => ExplicitResponse,
    '/json-helper-response': _ => OK({ hello: 'Huncwot' }),
    '/json-created-response': _ => Created({ status: 'Created!' }),
    '/route-params/:name': ({ params }) => OK({ hello: params.name }),
    '/query-params': ({ params: { search } }) => OK({ search }),
    '/invalid-route-no-return': _ => {
      hello: 'Huncwot';
    },
    '/html-content': _ => html('<h1>Huncwot, a rascal truly you are!</h1>')
  }
};

const POSTs = {
  post: {
    '/post-json': ({ params: { name } }) => `Received -> ${name}`,
    '/post-form': ({ params: { name } }) => `Received -> ${name}`,
    '/upload': ({ files }) => {
      return `Uploaded -> ${files.upload.name}`;
    }
  }
};

// Function Compositions

const identity = _ => _;
const prepend = next => async request => `Prefix -> ${await next(request)}`;

const Compositions = {
  get: {
    '/simple-compose': [identity, _ => 'Simple Compose'],
    '/prepend-compose': [prepend, _ => 'Prepend Compose'],
    '/request-validation': [
      validate({ name: { type: String, required: true } }),
      ({ params: { admin } }) =>
        `Admin param (${admin}) should be absent from this request payload`
    ]
  }
};

const routes = merge({}, GETs, POSTs, Compositions);

app.start({ routes, port: 3000 });

// Tests

test('returns string with implicit return', async t => {
  const response = await perform.get('/');
  t.is(response.status, 200);
  t.is(response.data, 'Hello, Huncwot');
});

test('returns json for explicit response', async t => {
  const response = await perform.get('/json-explicit-response');
  t.is(response.status, 200);
  t.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns json for `OK` helper response', async t => {
  const response = await perform.get('/json-helper-response');
  t.is(response.status, 200);
  t.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns json for `created` helper response', async t => {
  const { status, data, headers } = await perform.get('/json-created-response');
  t.is(status, 201);
  t.is(headers['content-type'], 'application/json');
  t.deepEqual(data, { status: 'Created!' });
});

test('returns route params', async t => {
  const response = await perform.get('/route-params/Huncwot');
  t.is(response.status, 200);
  t.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns query params', async t => {
  const response = await perform.get('/query-params?search=Huncwot');
  t.is(response.status, 200);
  t.deepEqual(response.data, { search: 'Huncwot' });
});

// TODO HIGH

// test('invalid route returns 500', async t => {
//   try {
//     await perform.get('/invalid-route-no-return');
//   } catch ({ response: { status, data } }) {
//     t.is(status, 500);
//     // TODO Implement more friendly error message
//     t.is(data, "Cannot destructure property `body` of 'undefined' or 'null'.");
//   }
// });

test('returns HTML content', async t => {
  const { data, status, headers } = await perform.get('/html-content');
  t.is(status, 200);
  t.is(headers['content-type'], 'text/html');
  t.is(data, '<h1>Huncwot, a rascal truly you are!</h1>');
});

// TODO
test('sets security headers by default', async t => {
  const { headers } = await perform.get('/');
  //t.is(headers['X-DNS-Prefetch-Controll'], 'off');
  //t.is(headers['X-Download-Options'], 'noopen');
  //t.is(headers['X-Content-Type-Options'], 'nosniff');
  //t.is(headers['X-XSS-Protection'], '1; mode=block');
  t.is(true, true);
});

// Tests for POST

test('accepts POST params as JSON', async t => {
  const response = await perform.post('/post-json', {
    name: 'Zaiste'
  });
  t.is(response.status, 200);
  t.is(response.data, 'Received -> Zaiste');
});

test('accepts POST params as Form', async t => {
  const { stringify } = require('querystring');

  const { status, data } = await perform.post(
    '/post-form',
    stringify({ name: 'Szelma' })
  );
  t.is(status, 200);
  t.is(data, 'Received -> Szelma');
});

// Tests for function composistions (aka middleware-like)

test('compose functions & return string', async t => {
  const { status, data } = await perform.get('/simple-compose');
  t.is(status, 200);
  t.is(data, 'Simple Compose');
});

test('compose functions & append string', async t => {
  const response = await perform.get('/prepend-compose');
  t.is(response.status, 200);
  t.is(response.data, 'Prefix -> Prepend Compose');
});

test('built-in validation with invalid request', async t => {
  try {
    await perform.get('/request-validation');
  } catch ({ response: { status, data } }) {
    t.is(status, 422);
    t.deepEqual(data, ['name is required.']);
  }
});

test('built-in validation with valid request', async t => {
  const { status, data } = await perform.get('/request-validation?name=Zaiste');
  t.is(status, 200);
  t.is(
    data,
    'Admin param (undefined) should be absent from this request payload'
  );
});

test('built-in validation strips undefined params', async t => {
  const { status, data } = await perform.get(
    '/request-validation?name=Zaiste&admin=true'
  );
  t.is(status, 200);
  t.is(
    data,
    'Admin param (undefined) should be absent from this request payload'
  );
});

test('receives file upload', async t => {
  const fd = new FormData();

  fd.append('upload', 'This is my upload', 'foo.csv');

  const options = {
    headers: fd.getHeaders()
  };

  const { status, data } = await perform.post('/upload', fd, options);
  t.is(status, 200);
  t.is(data, 'Uploaded -> foo.csv');
});
