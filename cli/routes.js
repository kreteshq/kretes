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

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const color = require('chalk');

const { build, translate } = require('../controller.js');

const routes = () => {
  console.log(color`╒ {cyan Routes on the {underline server}}`);
  console.log('│');

  for (let { resource, operation } of build()) {
    let { method, route } = translate(operation, resource.toLowerCase());

    console.log(color`├ {magenta ${method.toUpperCase().padEnd(13, ' ')}} ${route}`);
  }
  console.log('└─');

  console.log(color`╒ {cyan Routes on the {underline client}}`);
  let routes = [];

  for (let { path } of routes) {
    console.log(color`├ {magenta GET} ${path}`);
  }

  console.log('└─');
};

module.exports = {
  builder: _ => _,
  handler: routes
};
