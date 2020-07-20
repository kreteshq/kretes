// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:graphql'); // eslint-disable-line no-unused-vars

import { OK, HTMLString } from './response.js';

import { runHttpQuery, HttpQueryRequest } from 'apollo-server-core';
import { resolveGraphiQLString } from 'apollo-server-module-graphiql';
import { makeExecutableSchema } from 'graphql-tools';

function graphql(options) {
  return async request => {
    let method = request.request.method;
    let query = request.params;
    let { graphqlResponse, responseInit } = await runHttpQuery([], {
      method,
      options,
      query
    } as HttpQueryRequest);

    return OK(graphqlResponse);
  };
}

function graphiql(options) {
  return async request => {
    let query = request.params;
    let response = await resolveGraphiQLString(query, options, request);

    return HTMLString(response);
  };
}

module.exports = {
  graphiql,
  graphql,
  makeSchema: makeExecutableSchema
};
