// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Middleware } from "retes";
import { ServerRuntime } from "snowpack";

export const ServerSideRenderer = (runtime: ServerRuntime): Middleware => {
  return next => request => {

    const performServerSideRendering = async path => {
      const { exports: { render } } = await runtime.importModule(`${path}.js`);
      return await render();
    }

    request.context = { performServerSideRendering };

    return next(request);
  };
}
