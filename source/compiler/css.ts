// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import postcss from 'postcss';
import { join } from 'path';
import fs from 'fs-extra';

const CWD = process.cwd();

export const compileCSS = async () => {
  const { plugins } = require(join(CWD, 'config', 'postcss.config'));

  try {
    const content = await fs.readFile(join(CWD, 'stylesheets', 'main.css'));
    const { css } = await postcss(plugins).process(content, {
      from: 'stylesheets/main.css',
      to: 'main.css',
      map: { inline: true },
    });

    await fs.outputFile(join(CWD, 'public', 'main.css'), css);
  } catch (error) {
    if (error.name === 'CssSyntaxError') {
      console.error(`  ${error.message}\n${error.showSourceCode()}`);
    } else {
      throw error;
    }
  }
};
