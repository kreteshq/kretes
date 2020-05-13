// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { compile, escape } = require('boxwood');

interface Options {
  context?: object
  paths?: string[]
  path?: string
}

const render = async (source, options: Options = {}) => {
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

const precompile = async (files, options = {}) => {
  const { paths = [] } = options;
  const promises = files.map(({ source, path }) => {
    return compile(source, {
      cache: true,
      paths: [path, ...paths],
      path
    });
  });
  return Promise.all(promises);
};

export {
  render,
  precompile,
};
