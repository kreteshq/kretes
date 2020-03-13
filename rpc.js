const generateRPCOnClient = ({ name, methods }) => `
import ${name}ServiceInterface from "./Service/Interface";
import { ${name} } from "./Entity";

export type Send = (input: RequestInfo, init?: RequestInit) => Promise<Response>

export interface WebRPCError extends Error {
  code: string
  message: string
  status: number
}

class Requester {
  protected hostname: string;
  protected send: Send

  constructor(send: Send, hostname: string = 'http://localhost:5544') {
    this.hostname = hostname
    this.send = send
  }

  async parse<T>(response: Response): Promise<T> {
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

  prepareRequest(body = {}, headers = {}) {
    return {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
  };
}

export class ${name}Requester extends Requester implements ${name}ServiceInterface {
  constructor(send: Send, hostname: string = 'http://localhost:5544') {
    super(send, hostname);
  }

  ${Object.entries(methods).map(([method, { input, output }]) => {
    return `${method} = async (${input}): ${output} => {
    const url = this.hostname + '/rpc/${name}/${method}';
    let response = await this.send(url, this.prepareRequest())
    return this.parse<${name}>(response);
  }`;
  })}

}
`;

module.exports = {
  generateRPCOnClient
};
