// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { appendFile, outputFile, readFile } from 'fs-extra';
import Path from 'path';
import { red, underline } from 'colorette';

import { print, interpolate } from '../../util'

const IsPascalCase = /^[A-Z0-9]\w*/

export const handler = async ({ name }: { name: string }) => {
  if (!IsPascalCase.test(name)) {
    print(`${red("Error".padStart(10))} Component names should be written in ${underline('PascalCase')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  try {
    const templateDir = Path.join(Path.resolve(__dirname, '..', '..', '..'), 'template', 'cli');
    const content = await readFile(Path.join(templateDir, 'react.template.tsx'), 'utf-8');
    const interpolated = interpolate(content, { name });

    await outputFile(Path.join(cwd, 'components', `${name}.tsx`), interpolated, { flag: 'wx' });
    await appendFile(Path.join(cwd, 'components', 'index.tsx'), `export { ${name} } from './${name}';\n`)
    print(`Created '${name}' in 'components/'\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      print(`${red("Error".padStart(10))} The file '${name}' already exists\n`)
    } else {
      console.error(error.message)
    }
  }
};

export const command = ['component <name>', 'comp'];
