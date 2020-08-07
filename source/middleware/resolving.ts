// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from "debug";
const debug = Debug('ks:middleware:resolving') // eslint-disable-line no-unused-vars

import fs from 'fs-extra';
import { join } from 'path';

import RE from '../regexp';
import { JavaScriptString, InternalServerError } from '../response';
import { Vue } from '../manifest';

const Resolving = () => {
  return async ({ path }: any, next: any) => {
    if (!RE.IsModule.test(path)) {
      return next()
    }

    const id = path.replace(RE.IsModule, '');

    if (id === 'vue') {
      // TODO Handle runtime not found / installed scenerio
      const content = await fs.readFile(Vue.Runtime.Browser, 'utf-8')
      return JavaScriptString(content)
    }

    try {
      const packageJSONPath = join(process.cwd(), 'node_modules', id, 'package.json');
      const packageJSONContent = require(packageJSONPath);

      // get the ES module path by hand FIXME
      const modulePath = join(process.cwd(), 'node_modules', id, packageJSONContent.module);
      const content = await fs.readFile(modulePath, 'utf-8')
      return JavaScriptString(content);
    } catch (error) {
      return InternalServerError(`Cannot resolve: ${id}`);
    }
  }
}

export default Resolving;

