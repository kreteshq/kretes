// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import Debug from "debug";
const debug = Debug("ks:middleware:resolving"); // eslint-disable-line no-unused-vars

const Module = require("module");
import { promises as fs } from "fs";
import { join } from "path";

import RE from "../regexp";
import { OK, NotFound, InternalServerError, JavaScriptString } from "../response";

const resolve = (directory, moduleName) => {
  const filename = join(directory, "noop.js");

  const paths = Module._nodeModulePaths(directory);
  const makeResolver = () =>
    Module._resolveFilename(moduleName, {
      id: filename,
      filename,
      paths,
    });

  return makeResolver();
};

const Lookup = new Map([
  ["vue", "dist/vue.runtime.esm-browser.js"],
  ["react", "source.development.js"],
  ["react-dom", "source.development.js"],
]);

const readFile = async (path) => {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    if (!["ENOENT", "EISDIR"].includes(error.code)) {
      throw error;
    }
    return null;
  }
};

const Resolving = () => {
  return async ({ path }: any, next: any) => {
    if (!RE.IsModule.test(path)) {
      return next();
    }

    const id = path.replace(RE.IsModule, "");

    if (!id.endsWith('.map')) {
      const filepaths = [
        join("node_modules", id, Lookup.get(id) || ""),
        join("dist", "modules", id),
        join("dist", "modules", `${id}.js`),
        //resolve(process.cwd(), id),
      ]

      for (const filepath of filepaths) {
        const pkg = await readFile(filepath);
        if (pkg) {
          return JavaScriptString(pkg);
        }
      }
    } else {
      const sourcemap = await readFile(join(".modules", id));
      if (sourcemap) {
        return { statusCode: 200, body: sourcemap, type: 'application/json' };
      }
    }

    return InternalServerError(`Cannot resolve: ${id}`);
  };
};

export default Resolving;
