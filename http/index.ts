export async function GET<T = any>(path: string): Promise<T> {
  const response = await fetch(path);
  const result: T = await response.json();

  return result;
}

interface Payload {
  [name: string]: any;
}

const defaultHeaders = {
  'Content-Type': 'application/json'
};

const params = (method: string, payload: Payload, headers: Payload) => ({
  method,
  headers,
  body: JSON.stringify(payload)
})

export const POST = (path: string, payload: Payload, headers = defaultHeaders) =>
  fetch(path, params('POST', payload, headers))

export const PUT = (path: string, payload: Payload, headers = defaultHeaders) =>
  fetch(path, params('PUT', payload, headers))

export const PATCH = (path: string, payload: Payload, headers = defaultHeaders) =>
  fetch(path, params('PATCH', payload, headers))

export const DELETE = (path: string, headers = defaultHeaders) =>
  fetch(path, { method: 'DELETE', headers })
