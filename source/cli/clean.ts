// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import __ from 'chalk';
import { clearCache } from 'snowpack';

const VERSION = require('../../package.json').version;

export async function handler() {
  console.log(`${__.bold.blue('Kretes'.padStart(10))} ` + __`{bold ${VERSION}}`);

  await clearCache();
}

export const builder = _ => _
