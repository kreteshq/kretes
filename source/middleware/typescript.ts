// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export const debug = require('debug')('ks:middleware:typescript');

import { promises as fs } from 'fs'
import { join, format } from 'path';

import { JavaScriptString } from '../response';
import { App } from '../manifest';
import RE from '../regexp';

const open = async path => {
  let content;
  try {
    content = await fs.readFile(path, 'utf-8')
    return content;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  try {
    content = await fs.readFile(format({ name: path, ext: '.ts' }), 'utf-8')
    return content;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  try {
    content = await fs.readFile(join(path, 'index.ts'), 'utf-8')
    return content;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  throw Error("Not found")
}

const Extension = {
  isTypeScript(path: string) {
    return path.endsWith('.ts')
  }
}

const TransformingTypeScript = () => {
  return async (context: any, next: any) => {
    const { path: urlPath } = context

    if (!Extension.isTypeScript(urlPath) && !urlPath.startsWith("/features")) {
      return next()
    }

    const fsPath = join(process.cwd(), urlPath)
    const content = await open(fsPath);
    const transpiled = await App.transpile(content, { loader: 'ts' });

    return JavaScriptString(transpiled)
  }
}

export default TransformingTypeScript;
