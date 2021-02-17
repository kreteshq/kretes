export async function GET<T = any>(path: string): Promise<T> {
  const response = await fetch(path);
  const result: T = await response.json();

  return result;
}