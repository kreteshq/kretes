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

require('marko/node-require');
const { createGzip } = require('zlib');

const __current = process.cwd();
const isProduction = false;

require('lasso').configure({
  plugins: ['lasso-marko'],
  outputDir: __current + '/static',
  urlPrefix: "/",
  bundlingEnabled: isProduction, // Only enable bundling in production
  minify: isProduction, // Only minify JS and CSS code in production
  fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

function page(name, bindings) {
  const template = require(`${__current}/pages/${name}.marko`);
  return template.stream(bindings);
}

function gzip(body) {
  return {
    body: body.pipe(createGzip()),
    encoding: 'gzip'
  }
}

module.exports = {
  page,
  gzip,
};
