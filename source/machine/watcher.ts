const debug = require('debug')('ks:machine:watcher');

import { join, relative } from 'path';

import { Vue, App } from '../manifest';
import * as VueComponent from './vue';

type Action = 'vue:render' | 'vue:reload' | 'reload';
interface WSPayload {
  type: Action
  timestamp: number
  path?: string
}

const send = (payload: WSPayload) => {
  const formatted = JSON.stringify(payload, null, 2)
  debug(`update: ${formatted}`)

  App.WebSockets.forEach((s) => s.send(formatted))
}

export const VueHandler = async (file, timestamp = Date.now()) => {
  const fsPath = join(process.cwd(), file);
  const urlPath = `/${relative(process.cwd(), fsPath)}`;
  const memoDescriptor = Vue.Cache.Descriptor.get(fsPath);

  debug(`Vue Cache <delete> ${fsPath}`);
  Vue.Cache.delete(fsPath);

  const descriptor = await VueComponent.parse(fsPath);

  if (!descriptor) return
  if (!memoDescriptor) return

  let action: 'vue:reload' | 'vue:render' | undefined;

  if (!VueComponent.isEqual(descriptor.script, memoDescriptor.script))
    action = 'vue:reload'

  if (!VueComponent.isEqual(descriptor.template, memoDescriptor.template))
    action = 'vue:render'

  if (action) {
    send({
      type: action,
      timestamp,
      path: urlPath,
    })
  }
}
