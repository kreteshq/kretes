const debug = require('debug')('ks:manifest');

import { resolve, join, dirname } from 'path';

import WebSocket from 'ws';
import { Pool } from 'pg';
import { SnowpackDevServer } from 'snowpack';

export const App = {
  features(cursor: string) {
    return join(process.cwd(), 'features', cursor)
  },
  get BaseHTML() {
    return join(process.cwd(), 'site', 'index.html')
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
  Database: false,
  SnowpackServr: null as SnowpackDevServer
}

const ImportName = 'kretes/hot'
const FileSystemPath = resolve(__dirname, 'client.js')
const URLPath = `/${ImportName}`

export const HotReload = {
  ImportName,
  FileSystemPath,
  URLPath
}
