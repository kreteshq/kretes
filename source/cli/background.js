// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const { handler } = require('./background/start');

module.exports = {
  builder: _ => _.commandDir('background', { alias: 'bg' }),
  handler
};
