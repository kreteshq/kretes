// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const SPA = () => {
  return (context: any, next: any) => {
    if (context.path === "/") {
      context.path = '/index.html'
    }
    return next()
  }
}

export default SPA;
