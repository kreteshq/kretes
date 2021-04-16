// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Middleware } from "retes";

export const Security = (): Middleware => {
  return next => request => {
    const { response } = request;

    // FIXME attach after next invocation
    // to drop `response` requirement
    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');

    return next(request);
  };
};
