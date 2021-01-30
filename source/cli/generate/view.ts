// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { appendFile, outputFile, readFile } from 'fs-extra';
import Path from 'path';
import { red, underline } from 'colorette';

import { print, interpolate } from '../../util'

const IsPascalCase = /^[A-Z0-9]\w*/

export const handler = async ({ feature, name }: { feature: string, name: string }) => {
  if (!IsPascalCase.test(feature) || !IsPascalCase.test(name)) {
    print(`${red("Error".padStart(10))} Names of features and view files should be written in ${underline('PascalCase')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  try {
    const templateDir = Path.join(Path.resolve(__dirname, '..', '..', '..'), 'template', 'cli');
    const content = await readFile(Path.join(templateDir, 'view.react.template.tsx'), 'utf-8');
    const interpolated = interpolate(content, { name });

    await outputFile(Path.join(cwd, 'features', feature, 'View', `${name}.tsx`), interpolated, { flag: 'wx' });
    await appendFile(Path.join(cwd, 'features', feature, 'View', 'index.tsx'), `export { ${name} } from './${name}';\n`)
    print(`Created '${name}' in 'features/${feature}/View'\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      print(`${red("Error".padStart(10))} The file '${name}' already exists\n`)
    } else {
      console.error(error.message)
    }
  }
};

export const command = ['view <feature> <name>', 'v'];
