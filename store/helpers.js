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

import { isObject } from './util';

const makePath = (path, target = '') => {
  path = path.replace(/\/+$/, '');
  const value = path.includes('@') ? path + '.' + target : path + '/' + target;
  return value;
};

const makePathsHash = paths =>
  paths.reduce((paths, path) => {
    const key = path.match(/\w+$/);
    paths[key] = path;
    return paths;
  }, {});

const makePaths = (path, props, resolver) => {
  if (typeof path === 'string' && path.includes('*')) {
    return makePathsHash(resolver(path));
  }

  if (Array.isArray(path)) {
    return makePathsHash(path);
  }

  if (isObject(path)) {
    props = path;
    path = '';
  }

  if (Array.isArray(props)) {
    const paths = props.map(prop => {
      return makePath(path, prop);
    });
    return makePathsHash(paths);
  }

  if (isObject(props)) {
    return Object.keys(props).reduce((paths, key) => {
      paths[key] = makePath(path, props[key]);
      return paths;
    }, {});
  }

  return path;
};

export const make = (path, props, handler, resolver) => {
  const data = makePaths(path, props, resolver);

  if (typeof data === 'string') {
    return handler(data);
  }

  for (let key in data) {
    data[key] = handler(data[key]);
  }
  return data;
};
