const debug = require('debug')('ks:middleware:resolving')

import fs from 'fs-extra'

import RE from '../regexp';
import { JavaScriptString } from '../response';
import { Vue, App } from '../manifest';

const Resolving = () => {
  return async ({ path }: any, next: any) => {
    if (!RE.IsModule.test(path)) {
      return next()
    }

    const id = path.replace(RE.IsModule, '')

    if (id === 'vue') {
      // TODO Handle runtime not found / installed scenerio
      const content = await fs.readFile(Vue.Runtime.Browser, 'utf-8')
      return JavaScriptString(content)
    }

    if (RE.IsFeaturesImport.test(id)) {
      const content = await fs.readFile(App.features(id), 'utf-8')
      return JavaScriptString(content)
    }
  }
}

export default Resolving;

