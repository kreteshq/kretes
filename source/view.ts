// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { compile, escape } from 'boxwood';

interface Options {
  context?: object
  paths?: string[]
  path?: string
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

export const render = async (source: string, options: Options = {}): Promise<string> => {
  const { context = {}, paths = [], path = '.' } = options;
  const { template, html } = await compile(source, {
    cache: process.env.NODE_ENV === 'production',
    paths: [path, ...paths],
  });
  if (html) {
    return html;
  }
  return template(context, escape);
};

export const precompile = async (files: File[], { paths } = { paths: [] }): Promise<CompilerOutput[]> => {
  const promises = files.map(({ source, path }) => {
    return compile(source, {
      cache: true,
      paths: [path, ...paths],
      path
    });
  });
  return Promise.all(promises);
};
