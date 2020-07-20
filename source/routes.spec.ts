import test from 'ava';
import axios from 'axios';
import Kretes, { routing } from '.';

const { Route: { Resource } } = routing;

test('routes should be passed to the start method', async assert => {
  const server = new Kretes();
  const routes = [
    [ '/', { GET: _ => 'Hello, GET!'} ],
    [ '/', { POST: _ => 'Hello, POST!' } ],
    [ '/', { PUT: _ => 'Hello, PUT!' } ],
    [ '/', { DELETE: _ => 'Hello, DELETE!' } ]
  ];
  await server.start({ routes });
  const http = axios.create({ baseURL: `http://localhost:${server.port}` });
  const response1 = await http.get('/');
  const response2 = await http.post('/');
  const response3 = await http.put('/');
  const response4 = await http.delete('/');
  assert.deepEqual(response1.data, 'Hello, GET!');
  assert.deepEqual(response2.data, 'Hello, POST!');
  assert.deepEqual(response3.data, 'Hello, PUT!');
  assert.deepEqual(response4.data, 'Hello, DELETE!');
  await server.stop();
})

test('routes for REST resources', async assert => {
  const app = new Kretes();

  const routes = [
    ...Resource("Task")
  ];

  await app.start({ routes });
  const http = axios.create({ baseURL: `http://localhost:${app.port}` });
  const response = await http.get('/task');
  assert.deepEqual(response.data, "You need to create 'features/Task/Controller/browse.js'");
  await app.stop();
})

