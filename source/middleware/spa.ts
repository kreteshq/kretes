// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import fs from 'fs-extra';

import { HTMLString } from '../response';
import { App } from "../manifest";

const scriptSnippet = '<script type="module" src="/index.js"></script>';

export const SPA = (routes = []) => {
  return async (context, next) => {
    const { path } = context;

    const paths = routes.map(([name]) => name);
    if (!(path.startsWith('/_api') || paths.includes(path))) {
      let html = await fs.readFile(App.BaseHTML, 'utf-8')
      html = html!.replace('</body>', `${scriptSnippet}\n</body>`)
      return HTMLString(html)
    }

    return next()
  };
};
