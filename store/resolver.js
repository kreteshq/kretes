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

export const resolve = (store, cursor) => {
  const absPath = cursor.replace(/[/@]+/g, '.');

  const [statePath, subfieldPath] = cursor.split('@');

  let modulePath;
  if (statePath.includes('/')) {
    const keys = statePath.split('/');
    keys.pop();
    modulePath = keys.join('/');
  }

  if (modulePath && !store._modulesNamespaceMap[`${modulePath}/`]) {
    throw new Error(
      `Huncwot: Cannot find '${modulePath}' (module) via '${cursor}' (cursor)`
    );
  }

  return { absPath, statePath, subfieldPath };
};

export const resolveStates = (path, state) => {
  const last = path.match(/([^/@\.]+)$/)[1];
  const main = path.substring(0, path.length - last.length);
  const keys = main.replace(/\W+$/, '').split(/[/@.]/);

  let obj = main ? getValue(state, keys) : state;
  if (!obj) {
    console.error(`Huncwot: Unable to expand wildcard '${path}'`);
    return [];
  }

  const regexp = new RegExp('^' + last.replace(/\*/g, '\\w+') + '$');
  return Object.keys(obj)
    .filter(key => regexp.test(key))
    .map(key => main + key);
};

export const resolveHandlers = (path, hash) => {
  const regexp = new RegExp('^' + path.replace(/\*/g, '\\w+') + '$');
  return Object.keys(hash).filter(key => regexp.test(key));
};
