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

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    acc[k] = obj[k];
    return acc;
  }, {});
}

function isObject(_) {
  return !!_ && typeof _ === 'object';
  //return !!_ && _.constructor === Object;
}

const substitute = (template, data) => {
  const start = '{{';
  const end = '}}';
  const path = '[a-z0-9_$][\\.a-z0-9_]*';
  const pattern = new RegExp(start + '\\s*(' + path + ')\\s*' + end, 'gi');

  return template.replace(pattern, (tag, token) => {
    let path = token.split('.');
    let len = path.length;
    let lookup = data;
    let i = 0;

    for (; i < len; i++) {
      lookup = lookup[path[i]];

      if (lookup === undefined) {
        throw new Error(`substitue: '${path[i]}' not found in '${tag}'`);
      }

      if (i === len - 1) {
        return lookup;
      }
    }
  });
};

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

module.exports = { pick, isObject, substitute, compose };
