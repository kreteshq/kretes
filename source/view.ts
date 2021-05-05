// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { join } from "path";
import { compile, escape } from 'boxwood';
import { promises as fs } from 'fs';
import fg from 'fast-glob';

const memory: Record<string, string> = {}

interface Options {
  cache?: boolean
}

interface File {
  source: string;
  path: string;
}

interface Options {
  context?: object;
  paths?: string[];
  path?: string;
}

interface CompilerError {
  message: string;
  type: string;
  stack: string;
}

interface CompilerWarning {
  message: string;
  type: string;
  stack: string;
}

interface CompilerOutput {
  template(content, escape): string;
  errors: CompilerError[];
  warnings: CompilerWarning[];
  from: string;
}

interface File {
  source: string;
  path: string;
}

const cwd = process.cwd();

export const render = async (source: string, options: Options = {}): Promise<string> => {
  const { context = {}, paths = [], path = '.' } = options;
  const { template } = await compile(source, {
    cache: process.env.NODE_ENV === 'production',
    paths: [path, ...paths],
  });
  return template(context, escape);
};

export const precompile = async (files: File[], { paths } = { paths: [] }): Promise<CompilerOutput[]> => {
  const promises = files.map(({ source, path }) => {
    return compile(source, {
      cache: true,
      paths: [path, ...paths],
      path,
    });
  });
  return Promise.all(promises);
};

export const lookupViews = async () => {
  const path = join(cwd, "site/**/*.html");
  const files = await fg(path);
  return readAll(files, { cache: true });
};

export const read = async (path: string, { cache }: Options = {}) => {
  if (cache && memory[path]) { 
    return memory[path] 
  }

  const content = await fs.readFile(path, 'utf-8')
  if (cache) { memory[path] = content }

  return content
}

export const readAll = async (patterns, options = {}): Promise<File[]> => {
  const paths = await fg(patterns);
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

