// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import fs from 'fs-extra';
import { SnowpackDevServer } from "snowpack";
import { join } from 'path';

import { HTMLString } from '../response';
import { App } from "../manifest";
import { Middleware } from 'retes';

const scriptSnippet = (path) => {
  const location = path.endsWith("/") ? path.slice(0, -1) : path;

  return `<script type="module" src="${location}/index.js"></script>`;
}

export const SPA = (routes = [], server: SnowpackDevServer): Middleware => {
  const runtime = server.getServerRuntime();
  return next => async request => {
    const { path } = request;

    const paths = [...routes.map(([name]) => name), '/favicon.ico'];
    if (!(path.startsWith('/_api') || paths.includes(path))) {
      let app;

      try {
        // check if SSR is requsted (existance of `_server.tsx`)
        await fs.stat(join(process.cwd(), 'site', path, '_server.tsx'))

        const { exports: { render } } = await runtime.importModule(`${path === '/' ? '' : path}/_server.js`);
        app = render();
      } catch (error) {
        console.log(error.message)
      }

      let html = await fs.readFile(App.BaseHTML, 'utf-8')

      if (app) {
        html = html.replace('<div id="app"></div>', `<div id="app">${app}</div>`);
      }

      // FIXME add CSS

      return HTMLString(html)
    }

    return next(request)
  };
};
