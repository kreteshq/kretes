// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export const debug = require('debug')('ks:middleware:typescript');

import { promises as fs } from 'fs'
import { join, format } from 'path';

import { JavaScriptString } from '../response';
import { App } from '../manifest';

const open = async path => {
  let content;

  // try a file
  try {
    content = await fs.readFile(path, 'utf-8')
    return { content, loader: 'ts' };
  } catch (error) {
    if (!['ENOENT', 'EISDIR'].includes(error.code)) {
      throw error
    }
  }

  // append .ts and try a file
  try {
    content = await fs.readFile(format({ name: path, ext: '.ts' }), 'utf-8')
    return { content, loader: 'ts' };
  } catch (error) {
    if (!['ENOENT', 'EISDIR'].includes(error.code)) {
      throw error
    }
  }

  // append .tsx and try a file
  try {
    content = await fs.readFile(format({ name: path, ext: '.tsx' }), 'utf-8')
    return { content, loader: 'tsx' };
  } catch (error) {
    if (!['ENOENT', 'EISDIR'].includes(error.code)) {
      throw error
    }
  }

  // append index.ts and try a file
  try {
    content = await fs.readFile(join(path, 'index.ts'), 'utf-8')
    return { content, loader: 'ts' };
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  // append index.tsx and try a file
  try {
    content = await fs.readFile(join(path, 'index.tsx'), 'utf-8')
    return { content, loader: 'tsx' };
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
    const { content, loader } = await open(fsPath);
    const transpiled = await App.transpile(content, { loader });

    return JavaScriptString(transpiled)
  }
}

export default TransformingTypeScript;
