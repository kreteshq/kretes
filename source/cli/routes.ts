// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from 'debug';
const debug = Debug('ks:cli:routes'); // eslint-disable-line no-unused-vars

import __ from 'chalk';

import { build, translate } from '../controller';

export const handler = () => {
  console.log(__`╒ {cyan Routes on the {underline server}}`);
  console.log('│');

  // for (let { resource, operation } in build()) {
  //   let { method, route } = translate(operation, resource.toLowerCase());

  //   console.log(__`├ {magenta ${method.toUpperCase().padEnd(13, ' ')}} ${route}`);
  // }
  console.log('└─');

  console.log(__`╒ {cyan Routes on the {underline client}}`);
  let routes = [];

  for (let { path } of routes) {
    console.log(__`├ {magenta GET} ${path}`);
  }

  console.log('└─');
};

export const builder = _ => _;
