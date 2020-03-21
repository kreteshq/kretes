const test = require('ava');
const axios = require('axios');

const Huncwot = require('..');
const { OK, Created, HTMLString, Page } = require('../response.js');
const { validate } = require('../request');

const merge = require('merge-deep');
const FormData = require('form-data');

const app = new Huncwot();

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
    '/error': _ => Page('index@Unknown'),
    '/invalid-route-no-return': _ => {
      'Huncwot';
    },
    '/html-content': _ => HTMLString('<h1>Huncwot, a rascal truly you are!</h1>'),
    '/accept-header-1': ({ format }) => OK(format),
    '/explicit-format': ({ format }) => OK(format),
    '/id': ({ request }) => OK(request.id)
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

let get, post

test.before(async () => {
  let id = 0, sequence = () => id++;
  app.use(async (context, next) => {
    const { request } = context;
    request.id = `id-${sequence()}`;
    return next(context);
  });
  await app.start({ routes });
  const http = axios.create({ baseURL: `http://localhost:${app.port}` });
  get = http.get
  post = http.post
})

test.after(async () => {
  await app.stop();
})

// Tests

test('returns string with implicit return', async assert => {
  const response = await get('/');
  assert.is(response.status, 200);
  assert.is(response.data, 'Hello, Huncwot');
});

test('returns json for explicit response', async assert => {
  const response = await get('/json-explicit-response');
  assert.is(response.status, 200);
  assert.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns json for `OK` helper response', async assert => {
  const response = await get('/json-helper-response');
  assert.is(response.status, 200);
  assert.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns json for `created` helper response', async assert => {
  const { status, data, headers } = await get('/json-created-response');
  assert.is(status, 201);
  assert.is(headers['content-type'], 'application/json');
  assert.deepEqual(data, { status: 'Created!' });
});

test('returns route params', async assert => {
  const response = await get('/route-params/Huncwot');
  assert.is(response.status, 200);
  assert.deepEqual(response.data, { hello: 'Huncwot' });
});

test('returns query params', async assert => {
  const response = await get('/query-params?search=Huncwot');
  assert.is(response.status, 200);
  assert.deepEqual(response.data, { search: 'Huncwot' });
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

test('returns HTML content', async assert => {
  const { data, status, headers } = await get('/html-content');
  assert.is(status, 200);
  assert.is(headers['content-type'], 'text/html');
  assert.is(data, '<h1>Huncwot, a rascal truly you are!</h1>');
});

test('sets security headers by default', async assert => {
  const { headers } = await get('/');
  assert.is(headers['x-download-options'], 'noopen');
  assert.is(headers['x-content-type-options'], 'nosniff');
  assert.is(headers['x-xss-protection'], '1; mode=block');
  assert.is(true, true);
});

test('respects `Accept` header', async assert => {
  const { data, status } = await get('/accept-header-1', {
    headers: {
      Accept: 'text/plain'
    }
  });
  assert.is(status, 200);
  assert.is(data, 'plain');
});

test('respects explicit format query param', async assert => {
  const { data, status } = await get('/explicit-format?format=csv');
  assert.is(status, 200);
  assert.is(data, 'csv');
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

// Tests for POST

test('accepts POST params as JSON', async assert => {
  const response = await post('/post-json', {
    name: 'Zaiste'
  });
  assert.is(response.status, 200);
  assert.is(response.data, 'Received -> Zaiste');
});

test('accepts POST params as Form', async assert => {
  const { stringify } = require('querystring');

  const { status, data } = await post('/post-form', stringify({ name: 'Szelma' }));
  assert.is(status, 200);
  assert.is(data, 'Received -> Szelma');
});

// Tests for function composistions (aka middleware-like)

test('compose middlewares with .use', async assert => {
  const response = await get('/id');
  assert.is(response.status, 200);
  assert.truthy(response.data.startsWith('id-'))
})

test('compose functions & return string', async assert => {
  const { status, data } = await get('/simple-compose');
  assert.is(status, 200);
  assert.is(data, 'Simple Compose');
});

test('compose functions & append string', async assert => {
  const response = await get('/prepend-compose');
  assert.is(response.status, 200);
  assert.is(response.data, 'Prefix -> Prepend Compose');
});

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

test('receives file upload', async assert => {
  const fd = new FormData();

  fd.append('upload', 'This is my upload', 'foo.csv');

  const options = {
    headers: fd.getHeaders()
  };

  const { status, data } = await post('/upload', fd, options);
  assert.is(status, 200);
  assert.is(data, 'Uploaded -> foo.csv');
});
