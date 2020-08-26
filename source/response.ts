// Copyright 2020 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ReadStream } from 'fs'
import fs from 'fs';
const { dirname, join } = require('path');

const { read } = require('./filesystem');
const { render } = require('./view');

export type Response =
  | string
  | {
      body: string | object,
      statusCode: number,
      headers?: object
    }
  | Buffer
  | ReadStream;

const cwd = process.cwd();
// TODO auto-create those functions?

const OK = (body: any, headers = {}) => {
  return { headers, body, statusCode: 200 } as Response;
};

const Created = (resource: string | object | undefined = '', headers = {}) => {
  return {
    statusCode: 201,
    headers,
    body: resource,
  };
};

const Accepted = (body = '', headers = {}) => {
  return {
    statusCode: 202,
    headers,
    body
  };
};

const NoContent = (headers = {}) => {
  return {
    statusCode: 204,
    headers,
    body: '',
  };
};

const NotFound = (headers = {}) => {
  return {
    statusCode: 404,
    headers,
    body: fs.createReadStream(join(__dirname, '..', 'resources', '404.html')),
  };
};

const Redirect = (url, body = 'Redirecting...', statusCode = 302) => {
  return {
    statusCode,
    headers: { Location: url },
    type: 'text/plain',
    body,
  };
};

const NotModified = (headers) => {
  return {
    statusCode: 304,
    headers,
    body: null,
  };
};

const JSONPayload = (content, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(content),
    type: 'application/json',
  };
};

const HTMLStream = content => {
  const Readable = require('stream').Readable;

  const s = new Readable();
  s.push(content);
  s.push(null);

  return s;
};

const HTMLString = content => {
  return {
    statusCode: 200,
    type: 'text/html',
    body: content,
  };
};

const JavaScriptString = content => {
  return {
    statusCode: 200,
    type: 'application/javascript',
    body: content,
  };
};

const StyleSheetString = content => {
  return {
    statusCode: 200,
    type: 'text/css',
    body: content,
  };
}

const Unauthorized = () => {
  return {
    statusCode: 401,
    // TODO add WWW-Authenticate
    body: ''
  };
};

const Forbidden = message => {
  return {
    statusCode: 403,
    body: message
  };
};

const InternalServerError = message => {
  return {
    statusCode: 500,
    body: message
  };
};

const cache = process.env.NODE_ENV === 'production';

const Page = async (location: string, context: object) => {
  let path, paths;

  if (location.endsWith('.html')) {
    const dir = dirname(location);

    path = location;
    paths = [dir];
  } else if (location.includes('@')) {
    const [name, feature] = location.split('@');
    const views = join(cwd, 'views');
    const dir = join(cwd, 'features', feature, 'Page');

    path = join(dir, `${name}.html`);
    paths = [dir, join(views, 'parts')];
  } else {
    const views = join(cwd, 'views');

    path = join(views, 'pages', `${location}.html`);
    paths = [join(views, 'parts')];
  }

  const content = await read(path, { cache });
  const html = await render(content.toString(), { context, paths });
  return HTMLString(html);
};

const MIME = {
  isJavaScript: _ => _ === 'application/javascript',
}

export {
  OK,
  Created,
  Accepted,
  Redirect,
  NotModified,
  HTMLString,
  HTMLStream,
  JavaScriptString,
  StyleSheetString,
  JSONPayload,
  NotFound,
  NoContent,
  Unauthorized,
  Forbidden,
  InternalServerError,
  Page,
  MIME,
};
