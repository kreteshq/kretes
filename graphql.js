// Copyright 2018 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const debug = require('debug')('huncwot:graphql'); // eslint-disable-line no-unused-vars

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
