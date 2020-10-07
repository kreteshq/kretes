// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { createReadStream, ReadStream } from 'fs'
const { dirname, join } = require('path');

const { read } = require('./filesystem');
const { render } = require('./view');

type ResponseBody = string | object;
type Resource = ResponseBody | undefined;

export type Response =
  | string
  | {
      body: ResponseBody,
      statusCode: number,
      headers?: object
    }
  | Buffer
  | ReadStream;

const cwd = process.cwd();

const OK = (body: ResponseBody, headers = {}) => {
  return { headers, body, statusCode: 200 } as Response;
};

const Created = (resource: Resource = '', headers = {}) => {
  return {
    statusCode: 201,
    headers,
    body: resource,
  };
};

const Accepted = (resource: Resource = '', headers = {}) => {
  return {
    statusCode: 202,
    headers,
    body: resource
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
    type: 'text/html',
    headers,
    body: createReadStream(join(__dirname, '..', 'resources', '404.html')),
  };
};

const Redirect = (url: string, body = 'Redirecting...', statusCode = 302) => {
  return {
    statusCode,
    headers: { Location: url },
    type: 'text/plain',
    body,
  };
};

const NotModified = (headers = {}) => {
  return {
    statusCode: 304,
    headers,
    body: '',
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

const HTMLString = (content: string) => {
  return {
    statusCode: 200,
    type: 'text/html',
    body: content,
  };
};

const JavaScriptString = (content: string) => {
  return {
    statusCode: 200,
    type: 'application/javascript',
    body: content,
  };
};

const StyleSheetString = (content: string) => {
  return {
    statusCode: 200,
    type: 'text/css',
    body: content,
  };
}

const Unauthorized = () => {
  return {
    statusCode: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm=Authorization Required'
    },
    body: ''
  };
};

const Forbidden = (content: string = '') => {
  return {
    statusCode: 403,
    body: content
  };
};

const InternalServerError = (content: string = '') => {
  return {
    statusCode: 500,
    body: content
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

const OpenAPI = (info, paths) => {
  return JSONPayload({ openapi: '3.0.0', info, paths })
}

const RedocApp = () => {
  return HTMLString(`
<!DOCTYPE html>
<html>
  <head>
    <title>ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='/__rest.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"> </script>
  </body>
</html>
  `);
}

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
  OpenAPI,
  RedocApp,
};
