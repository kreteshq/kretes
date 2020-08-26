// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { promises as fs } from 'fs';
import fg from 'fast-glob';

const memory = {}

interface Options {
  cache?: boolean
}

interface File {
  source: string;
  path: string;
}

export const read = async (path, options: Options = {}): Promise<string> => {
  const { cache } = options
  if (cache && memory[path]) { return new Promise(resolve => resolve(memory[path])) }
  const content = await fs.readFile(path, 'utf-8')
  if (cache) { memory[path] = content }
  return content
}

export const glob = async (patterns, options = {}): Promise<string[]> => fg(patterns, options)

export const readAll = async (patterns, options = {}): Promise<File[]> => {
  const paths = await glob(patterns);
  const promises = paths.map(path => read(path, options));
  return Promise.all(promises).then(sources => {
    return sources.map((source, index) => {
      return {
        source,
        path: paths[index]
      }
    });
  });
}

