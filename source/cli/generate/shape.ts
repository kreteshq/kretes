// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { readFile, outputFile } from 'fs-extra';
import Path from 'path';
import { red, underline } from 'colorette';

import { print, interpolate } from '../../util'

const IsPascalCase = /^[A-Z0-9]\w*/

export const handler = async ({ feature }: { feature: string }) => {
  if (!IsPascalCase.test(feature)) {
    print(`${red("Error".padStart(10))} Names of features should be written in ${underline('PascalCase')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  try {
    const templateDir = Path.join(Path.resolve(__dirname, '..', '..', '..'), 'template', 'cli');
    const content = await readFile(Path.join(templateDir, 'shape.template'), 'utf-8');
    const interpolated = interpolate(content, { feature });

    await outputFile(Path.join(cwd, 'features', feature, 'Shape', 'index.ts'), interpolated, { flag: 'wx' });
    print(`Created in 'features/${feature}/Shape'\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      print(`${red("Error".padStart(10))} The file 'features/${feature}/Shape/index.ts' already exists\n`)
    } else {
      console.error(error.message)
    }
  }

};

export const command = ['shape <feature>', 's'];
