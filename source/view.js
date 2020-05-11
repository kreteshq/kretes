// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { compile, escape } = require('boxwood');

const render = async (source, options = {}) => {
  const { context = {}, paths = [] } = options;
  const { template, html } = await compile(source, {
    cache: process.env.NODE_ENV === 'production',
    paths: ['.', ...paths],
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
      paths: [path, ...paths]
    });
  });
  return Promise.all(promises);
};

module.exports = {
  render,
  precompile,
};
