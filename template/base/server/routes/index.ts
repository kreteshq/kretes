import fs from 'fs';
import { Routes } from 'kretes';
import { GET, POST } from 'kretes/route';
import { OK } from 'kretes/response';

export const routes: Routes = [
  // implicit `return` with a `text/plain` response
  GET('/hello', (_request) => 'Hello, Kretes!'),
  GET('/json', (_request) => {
    // explicit `return` with a 200 response of `application/json` type
    return OK({ a: 1, b: 2 });
  }),
  GET('/stream', (_request) => {
    // stream the response
    return fs.createReadStream('static/index.html');
  }),
  GET('/headers', (_request) => {
    // set your own headers
    return { body: 'Hello B', statusCode: 201, headers: { Authorization: 'PASS' } };
  }),
  POST('/bim', (request) => {
    // request body is parsed in `params` by default
    return `Hello POST! ${request.params.name}`;
  }),
];
