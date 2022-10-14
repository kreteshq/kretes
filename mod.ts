import type { Handler, Pipeline, Routes } from "wren/types.ts";
import type { Manifest, PageProps } from "./types.ts";

import * as Response from "wren/response.ts"
import render from 'preact-render-to-string'

import * as Middleware from './middleware/page.ts';

export const setup = (manifest: Manifest) => {
  const routes: Routes = [];

  for (const [pathname, { default: page, handler }] of Object.entries(manifest.routes)) {
    if (handler && page) {
      routes.push([
        pathname, [Middleware.Page(page), handler] as Pipeline
      ]);
    } else if (handler) {
      routes.push([pathname, handler as Handler | Pipeline]);
    } else if (page) {
      routes.push([pathname, {
        GET: (request) => {
          const { params } = request;

          // FIXME
          return Response.HTML(render(page({ params } as PageProps)!));
        }
      }]);
    } else {
      // FIXME
    }
  }

  return routes;
}

export * from './types.ts';