import type { Handler, Middleware } from "wren";
import { PageComponent, PageProps } from "../types.ts";

export const Page = (page: PageComponent): Middleware => (handler: Handler) => (request, connInfo) => {
  const { url, params } = request;

  request.page = <T = unknown>(data: T) => page({
    url: new URL(url),
    params,
    data
  } as PageProps<T>)

  return handler(request, connInfo);
}