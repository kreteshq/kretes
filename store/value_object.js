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

export default class {
  constructor(expr, path, value) {
    this.expr = expr;
    this.path = path;
    this.value = value;
  }

  update(target) {
    const success = this.assign(target, this.path, this.value, false);

    if (!success && process.env.NODE_ENV !== 'production') {
      console.error(
        `Huncwot: Cannot create property for '${this.expr}' (path)`
      );
      return target;
    }

    return Object.assign({}, target);
  }

  assign(state, path, value) {
    const keys = path.split('.');
    return keys.reduce((obj, key, index) => {
      if (!obj) {
        return false;
      } else if (index === keys.length - 1) {
        obj[key] = value;
        return true;
      } else if (!isObject(obj[key]) || !(key in obj)) {
        return false;
      }
      return obj[key];
    }, state);
  }
}
