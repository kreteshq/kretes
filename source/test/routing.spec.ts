import test from 'ava';
import axios from 'axios';
import Kretes, { response, routing } from '..';

const { Route } = routing
const { GET } = Route
const {
  OK,
  Created,
  Accepted,
  NoContent,
  NotFound,
  Redirect,
  NotModified,
  JSONPayload,
  HTMLString,
  JavaScriptString,
  StyleSheetString,
  Unauthorized,
  Forbidden,
  InternalServerError
} = response

test('GET handlers can return string as the response', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => 'Hello, Kretes')
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, 'Hello, Kretes')
  await server.stop();
});

test('GET handlers can return objects as the response', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => ({ statusCode: 200, body: { foo: "bar" } }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, { foo: "bar" })
  await server.stop();
})

test('GET handlers can return arrays as the response', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => ({ statusCode: 200, body: ["foo", "bar"] }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, ["foo", "bar"])
  await server.stop();
})

test('GET handlers can use the OK response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => OK({ foo: "bar" }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, { foo: "bar" })
  await server.stop();
})

test('GET handlers can use the Created response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => Created({ foo: "bar" }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 201)
  assert.deepEqual(response.data, { foo: "bar" })
  await server.stop();
})

test('GET handlers can use the Accepted response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => Accepted({ foo: "bar" }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 202)
  assert.deepEqual(response.data, { foo: "bar" })
  await server.stop();
})

test('GET handlers can use the NoContent response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => NoContent())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 204)
  assert.deepEqual(response.data, '')
  await server.stop();
})

test('GET handlers can use the NotFound response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => NotFound())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  try {
    await http.get('/');
  } catch (exception) {
    const { response } = exception
    assert.deepEqual(response.status, 404)
    assert.truthy(response.data.includes('Not Found'))
  }
  await server.stop();
})

test('GET handlers can use the Redirect response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => Redirect('/foo')),
    GET('/foo', _ => OK('success'))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.truthy(response.data.includes('success'))
  await server.stop();
})

test('GET handlers can use the NotModified response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => NotModified())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  try {
    await http.get('/');
  } catch (exception) {
    const { response } = exception
    assert.deepEqual(response.status, 304)
  }
  await server.stop();
})

test('GET handlers can use the JSONPayload response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => JSONPayload({ foo: 'bar' }))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, { foo: 'bar' })
  assert.deepEqual(response.headers['content-type'], 'application/json')
  await server.stop();
})

test('GET handlers can use the HTMLString response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => HTMLString('<html><head<title>foo</title></head><body>bar<body></html>'))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, '<html><head<title>foo</title></head><body>bar<body></html>')
  assert.deepEqual(response.headers['content-type'], 'text/html')
  await server.stop();
})

test('GET handlers can use the JavaScriptString response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => JavaScriptString('function foo() {}'))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, 'function foo() {}')
  assert.deepEqual(response.headers['content-type'], 'application/javascript')
  await server.stop();
})

test('GET handlers can use the StyleSheetString response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => StyleSheetString('.foo { color: red; }'))
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response = await http.get('/');
  assert.deepEqual(response.status, 200)
  assert.deepEqual(response.data, '.foo { color: red; }')
  assert.deepEqual(response.headers['content-type'], 'text/css')
  await server.stop();
})

test('GET handlers can use the Unauthorized response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => Unauthorized())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  try {
    await http.get('/');
  } catch (exception) {
    const { response } = exception
    assert.deepEqual(response.status, 401)
  }
  await server.stop();
})

test('GET handlers can use the Forbidden response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => Forbidden())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  try {
    await http.get('/');
  } catch (exception) {
    const { response } = exception
    assert.deepEqual(response.status, 403)
  }
  await server.stop();
})

test('GET handlers can use the InternalServerError response handler', async assert => {
  const server = new Kretes();
  await server.start([
    GET('/', _ => InternalServerError())
  ]);
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  try {
    await http.get('/');
  } catch (exception) {
    const { response } = exception
    assert.deepEqual(response.status, 500)
  }
  await server.stop();
})
