const debug = require('debug')('ks:manifest');

import { resolve, join, dirname } from 'path';

import resolver from 'resolve-from';
import LRUCache from 'lru-cache'
import { SFCDescriptor, SFCStyleCompileResults } from '@vue/compiler-sfc'
import * as VueCompiler from '@vue/compiler-sfc'
import WebSocket from 'ws';
import { Service as ESBuildService } from 'esbuild';
import { Pool } from 'pg';

export const Vue = {
  Cache: {
    Descriptor: new LRUCache<string, SFCDescriptor>(8),
    Template: new LRUCache<string, string>(8),
    Script: new LRUCache<string, string>(3),
    Styles: new LRUCache<string, SFCStyleCompileResults[]>(1),
    delete(entry: string) {
      Vue.Cache.Descriptor.del(entry)
      Vue.Cache.Template.del(entry)
      Vue.Cache.Script.del(entry)
      Vue.Cache.Styles.del(entry)
    }
  },
  Runtime: {
    get Browser() {
      const pkg = resolver(process.cwd(), 'vue/package.json')
      return join(dirname(pkg), 'dist', 'vue.runtime.esm-browser.js')
    }
  },
  Compiler: VueCompiler
}

export const App = {
  features(cursor: string) {
    return join(process.cwd(), 'features', cursor)
  },
  get BaseHTML() {
    return join(process.cwd(), 'config', 'client', 'index.html')
  },
  get isProduction() {
    return process.env.KRETES === 'production'
  },
  get TypeScriptConfigClient() {
    const path = join(process.cwd(), 'config', 'client', 'tsconfig.json');
    try {
      const { compilerOptions: { jsxFactory, jsxFragmentFactory } } = require(path);
      return { jsxFactory, jsxFragmentFactory };
    } catch (error) {
      throw Error("Errors in config/client/tsconfig.json");
    }
  },
  WebSockets: new Set<WebSocket>(),
  Importers: new Map<string, Set<string>>(),
  Importees: new Map<string, Set<string>>(),
  DatabasePool: null as Pool,
  ESBuild: null as ESBuildService,
  async transpile(source, { loader }) {
    const { jsxFactory, jsxFragmentFactory: jsxFragment } = this.TypeScriptConfigClient;

    const { code: transpiled } = await this.ESBuild.transform(source, { loader, jsxFactory, jsxFragment })
    return transpiled;
  }
}

const ImportName = 'kretes/hot'
const FileSystemPath = resolve(__dirname, 'client.js')
const URLPath = `/${ImportName}`

export const HotReload = {
  ImportName,
  FileSystemPath,
  URLPath
}

type VueArtifact = SFCDescriptor | string | SFCStyleCompileResults[]

export const memoize = (cache: LRUCache<string, VueArtifact>) => async (
  entry: string,
  provider: Function
) => {
  let memoized = cache.get(entry)
  if (memoized) {
    debug(`cache hit for ${entry}`)
    return memoized
  }

  const content = await provider()
  cache.set(entry, content)

  return content
}
