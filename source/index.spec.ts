import test from 'ava';
import axios from 'axios';

const { before, after } = test;

import Kretes, { response, request, routing } from '.';

const { Page } = response;
const { validate } = request;
const { Route: { GET, POST } } = routing;

const GETs = [
  GET('/error', _ => Page('index@Unknown', {}))
]

const Compositions = [
  GET('/request-validation',
    ({ params: { admin } }) =>
      `Admin param (${admin}) should be absent from this request payload`,
      {
        middleware: [ validate({ name: { type: String, required: true } }) ]
      }
  ),
 ];

const routes = [].concat(GETs, Compositions);

const app = new Kretes({ routes });
let get, post;

before(async () => {
  await app.start();
  const http = axios.create({ baseURL: `http://localhost:${app.port}` });
  get = http.get;
  post = http.post;
})

after(async () => {
  await app.stop();
})

// Tests

test('App: setup', async assert => {
  assert.deepEqual(typeof app.setup, 'function');
});


// TODO HIGH

// test('invalid route returns 500', async assert => {
//   try {
//     await get('/invalid-route-no-return');
//   } catch ({ response: { status, data } }) {
//     assert.is(status, 500);
//     // TODO Implement more friendly error message
//     assert.is(data, "Cannot destructure property `body` of 'undefined' or 'null'.");
//   }
// });


test.skip('sets security headers by default', async assert => {
  const { headers } = await get('/');
  assert.is(headers['x-download-options'], 'noopen');
  assert.is(headers['x-content-type-options'], 'nosniff');
  assert.is(headers['x-xss-protection'], '1; mode=block');
  assert.is(true, true);
});

test('renders an error page for an unexisting page handler', async assert => {
  try {
    await get('/error')
  } catch (exception) {
    const { response } = exception
    assert.truthy(response.data.includes('ENOENT'));
    assert.truthy(response.data.includes('Request'));
    assert.truthy(response.data.includes('Headers'));
    assert.truthy(response.data.includes('Cookies'));
  }
});

// Tests for function composistions (aka middleware-like)

test('built-in validation with invalid request', async assert => {
  try {
    await get('/request-validation');
  } catch ({ response: { status, data } }) {
    assert.is(status, 422);
    assert.deepEqual(data, ['name is required.']);
  }
});

test('built-in validation with valid request', async assert => {
  const { status, data } = await get('/request-validation?name=Zaiste');
  assert.is(status, 200);
  assert.is(data, 'Admin param (undefined) should be absent from this request payload');
});

test('built-in validation strips undefined params', async assert => {
  const { status, data } = await get('/request-validation?name=Zaiste&admin=true');
  assert.is(status, 200);
  assert.is(data, 'Admin param (undefined) should be absent from this request payload');
});
