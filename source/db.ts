// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import pg from 'pg';
import sqorn from '@sqorn/pg';
import { SQF } from '@sqorn/pg/types/sq'

import { App } from "./manifest";

// interface SQLStatement {
//   text: string
//   values: (string | number)[]
// }

const pool = new pg.Pool();
const db = sqorn({ pg, pool })

export default db;
