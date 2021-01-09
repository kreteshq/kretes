// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:graphql'); // eslint-disable-line no-unused-vars

import { JSONPayload, HTMLString } from '../response';
import { makeGraphQLRunner } from '../machine/graphql';
import { App } from '../manifest';
import { Endpoint } from '.';

export const GraphQL: Endpoint = async () => {
  const runner = await makeGraphQLRunner(App.DatabasePool);

  // TODO
  // https://www.graphile.org/postgraphile/make-extend-schema-plugin/
  // const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
  // const schema = makeSchema({ typeDefs, resolvers });

  return async ({ params: { query, variables } }) => {
    const result = await runner.query(query, variables);
    return JSONPayload(result);
  }
}

export const GraphiQL: Endpoint = () => {
  return async request => {
    return HTMLString(`
<html>
  <head>
    <title>Simple GraphiQL Example</title>
    <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
  </head>
  <body style="margin: 0;">
    <div id="graphiql" style="height: 100vh;"></div>

    <script
      crossorigin
      src="https://unpkg.com/react/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/graphiql/graphiql.min.js"
    ></script>

    <script>
      const fetcher = graphQLParams =>
        fetch('/_api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graphQLParams),
        })
          .then(response => response.json())
          .catch(() => response.text());
      ReactDOM.render(
        React.createElement(GraphiQL, { fetcher }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
</html>
`);
  };
}

