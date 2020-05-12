// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { promises as fs } from 'fs';

import { JavaScriptString } from '../response';
import { HotReload } from '../manifest';

const HotReloading = () => {
  return async ({ path }: any, next: any) => {
    if (path !== HotReload.URLPath) return next()

    const content = await fs.readFile(HotReload.FileSystemPath, 'utf-8')
    return JavaScriptString(content)
  }
}

export default HotReloading;
