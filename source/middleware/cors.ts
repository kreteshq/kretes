// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Middleware } from "retes";

export const CORS = (): Middleware => {
  return next => request => {
    const { method } = request;

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        body: '',
        headers
      };
    }

    request.headers = { ...request.headers, ...headers }

    return next(request);
  };
}
