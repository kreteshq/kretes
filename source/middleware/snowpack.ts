// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { SnowpackDevServer } from "snowpack";
import fs from 'fs-extra';

import { OK, HTMLString } from '../response';
import { App } from "../manifest";

const scriptSnippet = '<script type="module" src="/index.js"></script>';

export const Snowpack = (server: SnowpackDevServer, routes = []) => {
  return async (context, next) => {
    const { request: { url } } = context;

    if (url.endsWith(".js")) {
      const { contents, contentType } = await server.loadUrl(url);
      return OK(contents.toString(), { 'Content-Type': contentType })
    }

    const paths = routes.map(([name]) => name);
    if (!(context.path.startsWith('/_api') || paths.includes(context.path))) {
      let html = await fs.readFile(App.BaseHTML, 'utf-8')
      html = html!.replace('</body>', `${scriptSnippet}\n</body>`)
      return HTMLString(html)
    }

    return next()
  };
};
