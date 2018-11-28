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

export const isObject = value => !!value && typeof value === 'object';

export const hasValue = (obj, path) => {
  let keys = getKeys(path);
  if (isObject(obj)) {
    while (keys.length) {
      let key = keys.shift();
      if (hasKey(obj, key)) {
        obj = obj[key];
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const getKeys = value =>
  !value
    ? []
    : Array.isArray(value)
      ? value.map(key => String(key))
      : typeof value === 'object'
        ? Object.keys(value)
        : typeof value === 'string'
          ? value.match(/\w+/g) || []
          : [];

export const isPlainObject = value => isObject(value) && !Array.isArray(value);

export const hasKey = (obj, key) => isObject(obj) && key in obj;

export const getValue = (obj, path) => {
  let value = obj;
  const keys = getKeys(path);

  keys.every(key => {
    const valid = isPlainObject(value) && value.hasOwnProperty(key);
    value = valid ? value[key] : void 0;
    return valid;
  });
  return value;
};
