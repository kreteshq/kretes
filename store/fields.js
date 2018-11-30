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

import { resolve } from './resolver';
import { getValue, hasValue } from './util';
import ValueObject from './value_object';
import Container from './container';

export const prepareSync = path => ({
  get: prepareGet(path),
  set: prepareSet(path)
});

export const prepareGet = path => {
  let getter;
  return (...args) => {
    if (!getter) {
      getter = makeGetter(Container.store, path);
    }
    return getter(...args);
  };
};

const prepareSet = path => {
  let setter;
  return function(value) {
    if (!setter) {
      setter = makeSetter(Container.store, path);
    }
    this.$nextTick(() => this.$emit('sync', path, value));
    return setter(value);
  };
};

export function makeSetter(store, cursor) {
  const { statePath, subfieldPath } = resolve(store, cursor);

  const makeValue = value =>
    subfieldPath ? new ValueObject(cursor, subfieldPath, value) : value;

  if (statePath in store._actions)
    return value => store.dispatch(statePath, makeValue(value));
  if (statePath in store._mutations)
    return value => store.commit(statePath, makeValue(value));

  return value => {};
}

export function makeGetter(store, cursor) {
  const { statePath, subfieldPath, absPath } = resolve(store, cursor);

  if (statePath in store.getters) {
    return () => {
      const value = store.getters[statePath];
      return subfieldPath ? getValue(value, subfieldPath) : value;
    };
  }

  if (hasValue(store.state, statePath)) {
    return () => getValue(store.state, absPath);
  }

  return () => {};
}

export const expandGet = (path, state, getters) => [
  ...resolveStates(path, state),
  ...resolveHandlers(path, getters)
];

export const expandSync = (path, state) => resolveStates(path, state);
