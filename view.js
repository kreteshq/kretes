// Copyright 2016 Zaiste & contributors. All rights reserved.
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

const { createGzip } = require('zlib');
const { join } = require('path');
const { html } = require('./response');
const color = require('chalk');

const cwd = process.cwd();
const isProduction = false;

async function page(name, bindings) {
  const template = require(join(cwd, 'pages', `${name}.marko`));
  const error = require(join(__dirname, 'util', 'error.marko'));

  let r;
  try {
    r = await template.render(bindings);
  } catch (_) {
    console.error(
      `${color.bold.red(
        'Error:'
      )} there's a problem generating the page '${color.blue(name)}.marko'`
    );
    r = await error.render({ _ });
  }

  return html(r.getOutput());
}

function gzip(body) {
  return {
    body: body.pipe(createGzip()),
    encoding: 'gzip'
  };
}

module.exports = {
  page,
  gzip
};
