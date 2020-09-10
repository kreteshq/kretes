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
  NotFound
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
