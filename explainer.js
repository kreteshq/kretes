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

const color = require('chalk');

const explanations = {
  'relation "(\\w+)" does not exist': matches =>
    color`I cannot find the table named {underline ${matches[1]}} in your database. Have you run {underline huncwot database setup} before starting the application?`,
  'connect ECONNREFUSED 127.0.0.1:5432': _matches =>
    'It looks like you haven\'t started your database server.'
};

const wrap = (text, prepand = '', width = 80) =>
  text.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'),
    `$1\n${prepand}`
  );

module.exports = {
  for: error => {
    for (let [pattern, explanation] of Object.entries(explanations)) {
      let matches = error.message.match(pattern);
      if (matches) return wrap(explanation(matches), '  ');
    }
    return wrap('(missing)', '  ');
  }
};
