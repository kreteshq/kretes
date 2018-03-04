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

const debug = require('debug')('huncwot:security');
const assert = require('assert');

const Promise = require('bluebird');

function security(opts = {
  dnsPrefetchControl: false,
  poweredBy: false
}) {
  debug('%j', opts);

  const { dnsPrefetchControl, poweredBy } = opts;
  return async (context, next) => {
    const { response } = context;

    response.setHeader('X-DNS-Prefetch-Control', dnsPrefetchControl ? 'on' : 'off');
    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');


    if (poweredBy) {
      response.setHeader('X-Powered-By', poweredBy);
    } else {
      response.removeHeader('X-Powered-By');
    }

    return next();
  };
}

module.exports = security;
