// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { spawn } from 'child_process';

export const print = (message: string) => {
  console.log(message)
}

export function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    acc[k] = obj[k];
    return acc;
  }, {});
}

export function isObject(_) {
  return !!_ && typeof _ === 'object';
  //return !!_ && _.constructor === Object;
}

//const isObject = _ => !!_ && _.constructor === Object;

export const substitute = (template, data) => {
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

export const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

export const toBuffer = async stream => {
  const chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const streamToString = async stream => {
  let chunks = '';

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => (chunks += chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
};

export const parseCookies = (cookieHeader = '') => {
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

export const parseAcceptHeader = ({ accept = '*/*' }) => {
  const preferredType = accept.split(',').shift();
  const format = preferredType.split('/').pop();

  return format;
};

export const generateSourceMap = input => {
  if (!input) {
    return '';
  }
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }

  const map = Buffer.from(input).toString('base64');
  return `\n//# sourceMappingURL=data:application/json;base64,${map}`;
}

interface Options {
  stdout?: 'inherit' | 'pipe' | number
  stderr?: 'inherit' | 'pipe'
  cwd?: string
}

export const run = async (
  command,
  args,
  { stdout = 'inherit', stderr = 'inherit', cwd = '.' }: Options = {}
) => {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', stdout, stderr],
      cwd,
    });
    child.on('exit', code => {
      if (code) reject(new Error('exit code 1'));
      else resolve('');
    });
  });
};
