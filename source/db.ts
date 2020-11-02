// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import pg from 'pg';
import sqorn from '@sqorn/pg';

// interface SQLStatement {
//   text: string
//   values: (string | number)[]
// }

const pool = new pg.Pool();
const db = sqorn({ pg, pool })

export default db;
