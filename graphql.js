// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('kretes:graphql'); // eslint-disable-line no-unused-vars

const { OK, HTMLString } = require('./response.js');

const { runHttpQuery } = require('apollo-server-core');
const { resolveGraphiQLString } = require('apollo-server-module-graphiql');
const { makeExecutableSchema } = require('graphql-tools');

function graphql(options) {
  return async request => {
    let method = request.request.method;
    let query = request.params;
    let { graphqlResponse, responseInit } = await runHttpQuery([], {
      method,
      options,
      query
    });

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
