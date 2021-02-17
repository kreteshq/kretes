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

export function POST(path: string, payload: Payload, headers = defaultHeaders) {
  return fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })
}
