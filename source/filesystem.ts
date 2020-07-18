// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { promises as fs } from 'fs';
import fg from 'fast-glob';

const memory = {}

interface Options {
  cache?: boolean
}

export const read = async (path, options: Options = {}) => {
  const { cache } = options
  if (cache && memory[path]) { return new Promise(resolve => resolve(memory[path])) }
  const content = await fs.readFile(path, 'utf-8')
  if (cache) { memory[path] = content }
  return content
}

export const glob = async (patterns, options = {}) => fg(patterns, options)

export const readAll = async (patterns, options = {}) => {
  const files = await glob(patterns);
  const promises = files.map(path => read(path, options));
  return Promise.all(promises).then(sources => {
    return sources.map((source, index) => {
      return {
        source,
        path: files[index]
      }
    });
  });
}

