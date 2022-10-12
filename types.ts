
export interface PageProps<T = unknown> {
  url: URL;
  pathname: string;
  params: Record<string, string>;
  data: T
}
