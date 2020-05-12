// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const security = () => {
  return async (context, next) => {
    const { response } = context;

    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');

    return next(context);
  };
};

export default security;
