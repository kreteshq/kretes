import type { Handler, Pipeline, Routes } from "wren/types.ts";
import type { PageProps } from "./types.ts";

import * as Response from "wren/response.ts"
import { expandGlob } from 'fs'
import render from 'preact-render-to-string'

import * as Middleware from './middleware/page.ts';

const replaceSquareBracketsWithColons = (segment: string) => {
  const wildcardMatch = segment.match(/\[\.\.\.(.+)\]/);
  if (wildcardMatch) return `:${wildcardMatch[1]}*`

  const regularMatch = segment.match(/\[(.+)\]/);
  if (regularMatch) return `:${regularMatch[1]}`;

  return segment;
}

const convertFilenameToPathname = (filename: string) => {
  const pathname = filename
    .replace(/(\.page)?\.(ts|tsx)$/, '')
    .replace(/(\/)?index/, '')

  const segments = pathname.split("/");
  const convertedSegments = segments.map(replaceSquareBracketsWithColons).join("/")
  const result = `/${convertedSegments}`

  return result;
}

// ---

export const createRender = (renderFunc: Function, location: string) => async ({ data }: any) => {
  const { default: Page } = await import(location);
  return await renderFunc(Page({ data }));
}

export const setup = async (importer: Function) => {
  const routes: Routes = [];

  for await (const entry of expandGlob("routes/**/*.{ts,tsx}")) {
    const pathname = convertFilenameToPathname(entry.path.split('routes/').pop()!);

    const { default: Page, handler } = await importer(entry.path);

    if (handler && Page) {
      routes.push([
        pathname, [Middleware.Page, handler] as Pipeline
      ]);
    } else if (handler) {
      routes.push([pathname, handler as Handler | Pipeline]);
    } else if (Page) {
      routes.push([pathname, {
        GET: (request) => {
          const { params } = request;

          return Response.HTML(render(Page({ params } as PageProps)));
        }
      }]);
    } else {
      // FIXME
    }
  }

  return routes;
}

export * from './types.ts';