export interface RemoteMethodList {
  [name: string]: {
    input: string;
    output: string
  }
}

export const generateWebRPCOnClient = (name: string, methods: RemoteMethodList) => `
import { ${name} } from "${name}";

export interface WebRPCError extends Error {
  code: string
  message: string
  status: number
}

const hostname = 'http://localhost:5544'

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text)
  } catch (err) {
    throw { code: 'unknown', message: 'expecting JSON, got: ' + text, status: response.status } as WebRPCError
  }

  if (!response.ok) throw data

  return data
}

const prepareRequest = (body = {}, headers = {}) => {
  return {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
};

${Object.entries(methods).map(([method, { input, output }]) => {
  return `export const ${method} = async (${Object.entries(input).map(([name, type]) => `${name}: ${type}`)}): ${output} => {
  const url = hostname + '/rpc/${name}/${method}';
  let response = await fetch(url, prepareRequest())
  return parse<${name}>(response);
}`;
})}
`;

