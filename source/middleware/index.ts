// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import CORS from './cors';
import Caching from './caching';
import Extractor from './extractor';
import HotReloading from './hotreloading';
import Resolving from './resolving';
import Rewriting from './rewriting';
import Routing from './routing';
import Security from './security';
import Serve from './serve';
import SPA from './spa';
import Transforming from './transforming';

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
  CORS,
  Caching,
  Extractor,
  HotReloading,
  Resolving,
  Rewriting,
  Routing,
  Security,
  Serve,
  SPA,
  Transforming,
};
