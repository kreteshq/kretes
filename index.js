// Copyright 2019 Zaiste & contributors. All rights reserved.
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

const debug = require('debug')('huncwot:index'); // eslint-disable-line no-unused-vars
const { join } = require('path');
const Szelmostwo = require('szelmostwo');
const { serve, security } = require('szelmostwo/middleware');

const { notFound } = require('./response.js');

const { list, translate } = require('./handlers');

const cwd = process.cwd();
const handlerDir = join(cwd, '.build');

class Huncwot extends Szelmostwo {
  constructor({
    staticDir = join(cwd, 'static'),
    securityOptions = {
      dnsPrefetchControl: false,
      poweredBy: false
    },
    graphql = false,
    handlers = true,
    _verbose = false
  } = {}) {
    super();

    if (graphql) {
      try {
        const { typeDefs, resolvers } = require(join(cwd, 'graphql'));
        const { graphql, graphiql, makeSchema } = require('./graphql');

        const schema = makeSchema({ typeDefs, resolvers });

        this.post('/graphql', graphql({ schema }));
        this.get('/graphql', graphql({ schema }));
        this.get('/graphiql', graphiql({ endpointURL: 'graphql' }));
      } catch (error) {
        switch (error.code) {
          case 'MODULE_NOT_FOUND':
            console.log('GraphQL is not set up.');
            break;
          default:
            console.error(error);
            break;
        }
      }
    }

    if (handlers) {
      const handlers = list();
      for (let { resource, operation, path } of handlers) {
        try {
          const handler = require(join(handlerDir, path));
          let { method, route } = translate(operation, resource);
          this[method](route, request => handler(request));
        } catch (error) {
          console.error(error);
        }
      }
    }

    this.get('/', serve(staticDir), _ => notFound());
    this.get('/', security(securityOptions), _ => notFound());
  }
}

module.exports = Huncwot;
