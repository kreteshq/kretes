// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import pg from 'pg';
import sqorn from '@sqorn/pg';
import { SQF } from '@sqorn/pg/types/sq'

import { App } from "./manifest";

let sq: SQF = null;

export default new Proxy({}, {
  get(_target, prop, receiver) {
    // TODO That's a trick, improve it in the future
    if (sq == null) {
      sq = sqorn({ pg, pool: App.DatabasePool })
    }
    return Reflect.get(sq, prop, receiver);
  }
}) as SQF;
