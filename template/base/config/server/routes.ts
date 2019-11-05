const { OK } = require('huncwot/response');

const routes = {
  GET: {
    // implicit `return` with a `text/plain` response
    '/hello': (_: any) => 'Hello Huncwot',

    // explicit `return` with a 200 response of `application/json` type
    '/json': (_: any) => {
      return OK({ a: 1, b: 2 });
    },

    // set your own headers
    '/headers': (_: any) => {
      return { body: 'Hello B', statusCode: 201, headers: { 'Authorization': 'PASS' } };
    }
  },
  POST: {
    // request body is parsed in `params` by default
    '/bim': (request: any) => {
      return `Hello POST! ${request.params.name}`;
    }
  }
};

export default routes;
