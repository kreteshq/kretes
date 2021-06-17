// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { createReadStream } from 'fs';
import { join } from 'path';

// change to import maps when TS supports it
import { response } from 'retes';
const {
  OK,
  Created,
  Accepted,
  NoContent,
  Redirect,
  NotModified,
  JSONPayload,
  HTMLStream,
  HTMLString,
  JavaScriptString,
  StyleSheetString,
  Unauthorized,
  Forbidden,
  InternalServerError,
  MethodNotAllowed,
  BadRequest,
} = response;

import { render, read } from './view';

const cwd = process.cwd();

const Conflict = (content: string = '') => {
  return {
    statusCode: 409,
    body: content,
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

const cache = process.env.NODE_ENV === 'production';

interface Options {
  location?: string;
}

const Page = async (name: string, variables: object = {}, { location = 'server/views' }: Options = {}) => {
  const path = join(cwd, location, `${name}.html`);
  const paths = [join(cwd, 'parts')];

  const content = await read(path, { cache });
  const html = await render(content.toString(), { context: variables, paths });

  return HTMLString(html);
};

const MIME = {
  isJavaScript: (_) => _ === 'application/javascript',
};

export {
  Accepted,
  Created,
  Forbidden,
  HTMLStream,
  HTMLString,
  InternalServerError,
  JavaScriptString,
  JSONPayload,
  MIME,
  NoContent,
  NotFound,
  NotModified,
  OK,
  Page,
  Redirect,
  StyleSheetString,
  Unauthorized,
  Conflict,
  MethodNotAllowed,
  BadRequest,
};
