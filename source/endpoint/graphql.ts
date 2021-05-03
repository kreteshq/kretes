// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:graphql'); // eslint-disable-line no-unused-vars

import pg from 'pg';

import type {
  ASTVisitor,
  ValidationContext,
  ExecutionResult,
  FormattedExecutionResult,
  GraphQLSchema,
  GraphQLFieldResolver,
  GraphQLTypeResolver,
} from 'graphql';

import {
  Source,
  GraphQLError,
  parse,
  validate,
  execute,
  formatError,
  validateSchema,
  specifiedRules,
} from 'graphql';

import { OK, JSONPayload, HTMLString } from '../response';

import { makeGraphQLRunner } from '../machine/graphql';
import { Endpoint } from '.';

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

class PassObjectError extends Error {
  constructor(object = {}, ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PassObjectError)
    }

    this.name = 'PassObjectError'
  }
}

interface Options {
  schema: GraphQLSchema;
  context?: unknown;
  rootValue?: unknown;
  validationRules?: ReadonlyArray<(ctx: ValidationContext) => ASTVisitor>;

  fieldResolver?: GraphQLFieldResolver<unknown, unknown>;
  typeResolver?: GraphQLTypeResolver<unknown, unknown>;

  parseFn: Function
  validateFn: Function
  executeFn: Function
}

export const GraphQL: Endpoint = (options: Options) => {
  return async request => {
    const { params } = request;
    const { query, variables, operationName } = params;

    // FIXME if no `query`, `variables`, `operation` name
    // return 500

    const {
      schema,
      rootValue,
      validationRules = [],
      fieldResolver,
      typeResolver,
      context = request,
      parseFn = parse,
      executeFn = execute,
      validateFn = validate,
    } = options;

    let formatErrorFn = formatError;
    let result: ExecutionResult;

    try {
      const schemaErrors = validateSchema(schema);
      if (schemaErrors.length > 0) {
        throw new PassObjectError({ graphql: schemaErrors }, 'GraphQL schema validation error.');
      }

      let document;
      try {
        document = parseFn(new Source(query, 'GraphQL request'));
      } catch (error) {
        throw new PassObjectError({ graphql: [error] }, 'GraphQL syntax error.');
      }

      const validationErrors = validateFn(schema, document, [
        ...specifiedRules,
        ...validationRules,
      ]);

      if (validationErrors.length > 0) {
        throw new PassObjectError({ graphql: validationErrors }, 'GraphQL validation error.');
      }

      try {
        result = await executeFn({
          schema,
          document,
          rootValue,
          contextValue: context,
          variableValues: variables,
          operationName,
          fieldResolver,
          typeResolver,
        });
      } catch (error: unknown) {
        throw new PassObjectError({ graphql: [error] }, 'GraphQL execution context error.');
      }

      // FIXME add extensions
    } catch (error) {
      if (error.graphql == null) {
        const graphqlError = new GraphQLError(error.message, undefined, undefined, undefined, undefined, error);
        result = { data: undefined, errors: [graphqlError] };
      } else {
        result = { data: undefined, errors: error.graphql };
      }
    }

    const formattedResult: FormattedExecutionResult = {
      ...result,
      errors: result.errors?.map(formatErrorFn),
    };

    if (result.data == null) {
      return JSONPayload(formattedResult, 500);
    } 

    return OK(formattedResult)
  }
}

export const Postgraphile: Endpoint = async () => {
  const config = require("config");
  const connection = config.has("db") ? config.get("db") : {}; // node-pg supports env variables
  const pool = new pg.Pool(connection);

  const runner = await makeGraphQLRunner(pool);

  // TODO
  // https://www.graphile.org/postgraphile/make-extend-schema-plugin/
  // const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
  // const schema = makeSchema({ typeDefs, resolvers });

  return async ({ params: { query, variables } }) => {
    const result = await runner.query(query, variables);
    return JSONPayload(result);
  }
}
