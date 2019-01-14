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
const debug = require('debug')('huncwot:store');

import HTTP from 'axios';
import install from './install';
import { make } from './helpers';
import { prepareGet, prepareSync, expandSync, expandGet } from './fields';

import { getKeys } from './util';
import ValueObject from './value_object';
import { Model } from './model';

import Container from './container';

import { createDecorator } from 'vue-class-component';
import { mapState, mapGetters, mapActions } from 'vuex';

const getStateKeys = state =>
  getKeys(state instanceof Function ? state() : state);

const createMutations = state =>
  getStateKeys(state).reduce((obj, key) => {
    const mutation = key;
    obj[mutation] = (state, value) => {
      state[key] =
        value instanceof ValueObject ? value.update(state[key]) : value;
    };
    return obj;
  }, {});

export const generate = ({ resource, type }) => ({ state }) => {
  const _state = Object.assign(
    {},
    {
      item: {},
      collection: [],
      error: '',
      loading: true
    },
    state
  );

  const mutations = createMutations(_state);

  const actions = {
    async create({ commit, state }, item) {
      const collection = state.collection;
      collection.push(item);

      const result = await HTTP.post(`/rest/${resource}`, item);

      commit('collection', collection);
    },
    async browse({ commit }, { filter, sort, page } = {}) {
      const path = `/rest/${resource}`;

      try {
        const { data: collection } = await HTTP.get(path);
        commit('collection', collection);
      } catch (error) {
        commit('error', error.message);
      }
    },
    async fetch({ commit }, id) {
      const path = `/rest/${resource}/${id}`;

      try {
        const {
          data: [item]
        } = await HTTP.get(path);
        commit('item', item);
      } catch (error) {
        commit('error', error.message);
      }
    },
    async update({ commit, state }, item) {
      const result = await HTTP.put(`/rest/${resource}/${item.id}`, item);
      const { data: collection } = await HTTP.get(`/rest/${resource}`);
      commit('collection', collection);
    },
    async destroy({ commit, state }, id) {
      try {
        const result = await HTTP.delete(`/rest/${resource}/${id}`);

        const index = state.collection.findIndex(t => t.id === id);
        const collection = state.collection;
        collection.splice(index, 1);

        commit('collection', collection);
      } catch (error) {
        commit('error', error.message);
      }
    }
  };

  return { namespaced: true, mutations, actions, state: _state };
};

export const get = (path, props) =>
  make(path, props, prepareGet, path =>
    expandGet(path, Container.store.state, Container.store.getters)
  );

export const sync = (path, props) =>
  make(path, props, prepareSync, path =>
    expandSync(path, Container.store.state)
  );

export function namespace(namespace) {
  const buildNamespace = helper => {
    const namespacedHelper = (a, b) => {
      if (typeof b === 'string') {
        const key = b;
        const proto = a;
        return helper(key, { namespace })(proto, key);
      }

      const type = a;
      const options = merge(b || {}, { namespace });
      return helper(type, options);
    };

    return namespacedHelper;
  };

  return {
    getter: buildNamespace(getter),
    field: buildNamespace(field),
    action: buildNamespace(action)
  };
}

export const action = buildDecorator('methods', mapActions);
export const field = buildField();
export const getter = buildGetter();

function buildGetter() {
  function makeDecorator(alias, namespace) {
    return createDecorator((componentOptions, key) => {
      let ns = namespace || componentOptions.namespace;

      if (!componentOptions.computed) {
        componentOptions.computed = {};
      }

      componentOptions.computed[key] =
        ns !== undefined
          ? get(`${ns}/${alias || key}`)
          : get(`${alias || key}`);
    });
  }

  function helper(alias, isParameter) {
    if (typeof isParameter === 'string') {
      return makeDecorator(isParameter)(alias, isParameter);
    }
    const { namespace } = isParameter;
    return makeDecorator(alias, namespace);
  }

  return helper;
}

function buildField() {
  function makeDecorator(alias, namespace) {
    return createDecorator((componentOptions, key) => {
      let ns = namespace || componentOptions.namespace;

      if (!componentOptions.computed) {
        componentOptions.computed = {};
      }

      componentOptions.computed[key] =
        ns !== undefined ? sync(`${ns}/${key}`) : sync(`${key}`);
    });
  }

  function helper(alias, isParameter) {
    if (typeof isParameter === 'string') {
      return makeDecorator(isParameter)(alias, isParameter);
    }

    const { namespace } = isParameter;
    return makeDecorator(alias, namespace);
  }

  return helper;
}

function buildDecorator(bindTo, mapFn) {
  function makeDecorator(alias, namespace) {
    return createDecorator((componentOptions, key) => {
      let ns = namespace || componentOptions.namespace;

      if (!componentOptions[bindTo]) {
        componentOptions[bindTo] = {};
      }

      const mapObject = { [key]: alias };

      componentOptions[bindTo][key] =
        ns !== undefined ? mapFn(ns, mapObject)[key] : mapFn(mapObject)[key];
    });
  }

  function helper(alias, isParameter) {
    if (typeof isParameter === 'string') {
      return makeDecorator(isParameter)(alias, isParameter);
    }

    const { namespace } = isParameter;

    return makeDecorator(alias, namespace);
  }

  return helper;
}

function merge(a, b) {
  const res = {};
  [a, b].forEach(obj => {
    Object.keys(obj).forEach(key => {
      res[key] = obj[key];
    });
  });
  return res;
}

export { Model, install };
