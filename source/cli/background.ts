// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export { handler } from './background/start';
export const builder = _ => _
  .commandDir('background', { alias: 'bg' });
