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

//const isObject = _ => !!_ && _.constructor === Object;

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

const toBuffer = async stream => {
  const chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const streamToString = async stream => {
  let chunks = '';

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => (chunks += chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
};

const parseCookies = (cookieHeader = '') => {
  const cookies = cookieHeader.split(/; */);
  const decode = decodeURIComponent;

  if (cookies[0] === '') return {};

  const result = {};
  for (let cookie of cookies) {
    const isKeyValue = cookie.includes('=');

    if (!isKeyValue) {
      result[cookie.trim()] = true;
      continue;
    }

    let [key, value] = cookie.split('=');

    key.trim();
    value.trim();

    if ('"' === value[0]) value = value.slice(1, -1);

    try {
      value = decode(value);
    } catch (error) {
      // neglect
    }

    result[key] = value;
  }

  return result;
};

const parseAcceptHeader = ({ accept = '*/*' }) => {
  const preferredType = accept.split(',').shift();
  const format = preferredType.split('/').pop();

  return format;
};

const generateSourceMap = input => {
  if (!input) {
    return '';
  }
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }

  const map = Buffer.from(input).toString('base64');
  return `\n//# sourceMappingURL=data:application/json;base64,${map}`;
}

module.exports = {
  pick,
  isObject,
  substitute,
  compose,
  toBuffer,
  streamToString,
  parseCookies,
  parseAcceptHeader,
  generateSourceMap,
};
