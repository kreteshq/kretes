// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const SPA = (routes = []) => {
  const paths = routes.map(([name]) => name);
  return (context: any, next: any) => {
    if (!paths.includes(context.path)) {
      context.path = '/index.html'
    }
    return next()
  }
}

export default SPA;
