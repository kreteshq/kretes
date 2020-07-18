// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export { CORS } from './cors';
export { Caching } from './caching';
export { Extractor } from './extractor';
import HotReloading from './hotreloading';
import Resolving from './resolving';
import Rewriting from './rewriting';
export { Routing } from './routing';
import Security from './security';
export { Serve } from './serve';
import SPA from './spa';
import Transforming from './transforming';
import TransformingTypeScript from './typescript';

class Base extends Array {
  async next(context, last, current, done?, called?, func?) {
    if ((done = current > this.length)) return;

    func = this[current] || last;

    return (
      func &&
      func(context, async () => {
        if (called) throw new Error('next() already called');
        called = true;
        return this.next(context, last, current + 1);
      })
    );
  }

  async compose(context, last?) {
    return this.next(context, last, 0);
  }
}

export {
  Base,
  HotReloading,
  Resolving,
  Rewriting,
  Security,
  SPA,
  Transforming,
  TransformingTypeScript,
};
