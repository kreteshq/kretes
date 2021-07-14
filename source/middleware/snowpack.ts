// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import { Middleware } from 'retes';
import { SnowpackDevServer } from 'snowpack';

import { NotFound, OK } from '../response';

export const Snowpack = (server: SnowpackDevServer): Middleware => {
  return (next) => async (request) => {
    const { url } = request;

    if (url.endsWith('.js') || url.endsWith('.css')) {
      try {
        const { contents, contentType } = await server.loadUrl(url);
        return OK(contents.toString(), { 'Content-Type': contentType });
      } catch (error) {
        return NotFound();
      }
    }

    return next(request);
  };
};
