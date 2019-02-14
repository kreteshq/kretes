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

const { join, parse } = require('path');

const { scan } = require('./util');

async function list(dir) {
  return scan(dir)
    .filter(f => {
      const { name } = parse(f);
      return !name.startsWith('.');
    })
    .map(f => {
      const { dir, name } = parse(f);
      const path = join(dir, name);
      return { resource: dir, operation: name, path };
    });
}

function translate(name, resource) {
  const methods = {
    // BFCUD
    browse: { method: 'get', route: `/${resource}` },
    fetch: { method: 'get', route: `/${resource}/:id` },
    create: { method: 'post', route: `/${resource}` },
    update: { method: 'put', route: `/${resource}/:id` },
    destroy: { method: 'delete', route: `/${resource}/:id` }
  };

  return methods[name];
}

module.exports = {
  list,
  translate
};
