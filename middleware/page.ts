import type { Handler, Middleware } from "wren";
import { join } from 'path';

export const Page: Middleware = (handler: Handler) => async (request, connInfo) => {
  const { url, params } = request;
  const { pathname } = new URL(url);

  // FIXME with dynamic segments

  const location = `${join(Deno.cwd(), 'routes', pathname)}.page.tsx`;
  const { default: Page } = await import(location);

  request.page = <T = unknown>(data: T) => Page({ url, pathname, params, data });

  return handler(request, connInfo);
}