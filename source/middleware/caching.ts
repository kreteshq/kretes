// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import Debug from 'debug';
const debug = Debug('ks:middleware:caching'); // eslint-disable-line no-unused-vars

import crypto from 'crypto';
import Stream from 'stream';
import { NotModified } from '../response';
import { CompoundResponse, Middleware } from 'retes';

export const Caching = (): Middleware => {
  return next => async request => {
    const response = await next(request);

    const { body, headers = {}, statusCode } = response as CompoundResponse;

    if (!body || 'ETag' in headers) return response;

    const status = (statusCode / 100) | 0;
    if (2 != status) return response;

    let content;
    if (body instanceof Stream) {
      // FIXME for now don't cache streams
      return response;
    } else if ('string' == typeof body || Buffer.isBuffer(body)) {
      content = body;
    } else {
      content = JSON.stringify(body);
    }

    const hash = crypto
        .createHash('sha1')
        .update(content, 'utf8')
        .digest('base64')
        .substring(0, 27);

    const length = typeof content === 'string'
          ? Buffer.byteLength(content, 'utf8')
          : 666;

    const etag = `"${length.toString(16)}-${hash}"`;
    //@ts-ignore
    headers.ETag = etag;

    if (isFresh(request.headers, headers)) {
      return NotModified(headers);
    }

    return response;
  };
};

// TODO Handle the RFC properly (header names casing etc)
// the `fresh` package doesn't handle that
const isFresh = (requestHeaders, responseHeaders) => {
  const fromRequest = requestHeaders['if-none-match'];
  const fromResponse = responseHeaders['ETag'];

  return fromResponse === fromRequest;
};
