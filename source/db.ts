// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import pg from 'pg';
import sqorn from '@sqorn/pg';

import { SQF } from '@sqorn/pg/types/sq';

// interface SQLStatement {
//   text: string
//   values: (string | number)[]
// }

let sq: SQF = undefined;

export default new Proxy({}, {
  get(_target, prop, receiver) {
    // TODO That's a trick, improve it in the future
    if (sq == undefined) {
      const config = require("config");
      const connection = config.has("db") ? config.get("db") : {}; // node-pg supports env variables
      const pool = new pg.Pool(connection);
      sq = sqorn({ pg, pool });
    }
    return Reflect.get(sq, prop, receiver);
  },
}) as SQF;

