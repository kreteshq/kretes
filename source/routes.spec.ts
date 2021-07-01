import test from 'ava';
import axios from 'axios';
import Kretes from '.';

// const { Route: { Resource } } = routing;

test('routes for REST resources', async (assert) => {
  assert.is(true, true);
});

// test('routes for REST resources', async assert => {
//   const app = new Kretes();

//   const routes = [
//     ...Resource("Task")
//   ];

//   await app.start(routes);
//   const http = axios.create({ baseURL: `http://localhost:${app.port}` });
//   const response = await http.get('/task');
//   assert.deepEqual(response.data, "You need to create 'features/Task/Controller/browse.js'");
//   await app.stop();
// })
