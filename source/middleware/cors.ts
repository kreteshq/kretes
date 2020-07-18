// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export const CORS = () => {
  return async (context, next) => {
    const { method } = context.request;

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

    return next({ headers });
  };
}
