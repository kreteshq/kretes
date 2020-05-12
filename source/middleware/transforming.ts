export const debug = require('debug')('ks:middleware:transforming');

import { join } from 'path';

import { NotFound, JavaScriptString } from '../response';
import * as VueMachine from '../machine/vue';
import { Vue, memoize } from '../manifest';

const Extension = {
  isVue(path: string) {
    return path.endsWith('.vue')
  }
}

const Transforming = () => {
  return async (context: any, next: any) => {
    const {
      query: { type, index, module },
      path: urlPath
    } = context

    if (!Extension.isVue(urlPath)) return next()

    const fsPath = join(process.cwd(), urlPath)

    debug(fsPath);
    const descriptor = await memoize(Vue.Cache.Descriptor)(fsPath, () =>
      VueMachine.parse(fsPath, context.body)
    )

    if (!descriptor) return NotFound()

    if (!type) {
      const body = await memoize(Vue.Cache.Script)(fsPath, () =>
        VueMachine.compile(descriptor, fsPath, urlPath)
      )

      return JavaScriptString(body)
    }

    if (type === 'template') {
      const body = await memoize(Vue.Cache.Template)(fsPath, () =>
        VueMachine.compileTemplate(
          descriptor.template!,
          fsPath,
          urlPath,
          descriptor.styles.some((s) => s.scoped)
        )
      )

      return JavaScriptString(body)
    }
  }
}

export default Transforming;
