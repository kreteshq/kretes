// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:graphql'); // eslint-disable-line no-unused-vars

import { JSONPayload, HTMLString } from '../response';
import { makeGraphQLRunner } from '../machine/graphql';
import { App } from '../manifest';

export const GraphQL = async () => {
  const runner = await makeGraphQLRunner(App.DatabasePool);

  return async ({ params: { query, variables } }) => {
    const result = await runner.query(query, variables);
    return JSONPayload(result);
  }
}

export const GraphiQL= (options) => {
  return async request => {
    return HTMLString("Not implemented");
  };
}

