import fs from 'fs';
import { Routes, response, routing } from 'kretes';

const { OK } = response;
const { Route: { GET, POST } } = routing;

const routes: Routes = [
  // implicit `return` with a `text/plain` response
  GET('/hello', _ => 'Hello, Kretes!'),
  GET('/json', _ => {
    // explicit `return` with a 200 response of `application/json` type
    return OK({ a: 1, b: 2 });
  }),
  GET('/stream', _ => {
    // stream the response
    return fs.createReadStream('static/index.html');
  }),
  GET('/headers', _ => {
    // set your own headers
    return { body: 'Hello B', statusCode: 201, headers: { 'Authorization': 'PASS' } };
  }),
  POST('/bim', request => {
    // request body is parsed in `params` by default
    return `Hello POST! ${request.params.name}`;
  })
];

export default routes;
