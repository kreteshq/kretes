// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { createReadStream } from "fs";
import { dirname, join } from "path";

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
} = response;

const { read } = require("./filesystem");
const { render } = require("./view");

const cwd = process.cwd();

const Conflict = (content: string = '') => {
  return {
    statusCode: 409,
    body: content
  }
}

const NotFound = (headers = {}) => {
  return {
    statusCode: 404,
    type: "text/html",
    headers,
    body: createReadStream(join(__dirname, "..", "resources", "404.html")),
  };
};

const cache = process.env.NODE_ENV === "production";

const Page = async (location: string, context: object) => {
  let path, paths;

  if (location.endsWith(".html")) {
    const dir = dirname(location);

    path = location;
    paths = [dir];
  } else if (location.includes("@")) {
    const [name, feature] = location.split("@");
    const views = join(cwd, "views");
    const dir = join(cwd, "features", feature, "Page");

    path = join(dir, `${name}.html`);
    paths = [dir, join(views, "parts")];
  } else {
    const views = join(cwd, "site");

    path = join(views, `${location}.html`);
    paths = [join(cwd, "parts")];
  }

  const content = await read(path, { cache });
  const html = await render(content.toString(), { context, paths });
  return HTMLString(html);
};


const MIME = {
  isJavaScript: (_) => _ === "application/javascript",
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
};
