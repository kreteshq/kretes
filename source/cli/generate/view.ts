// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { appendFile, outputFile } from 'fs-extra';
import Path from 'path';
import { red, underline } from 'colorette';

import { print } from '../../util'

const IsPascalCase = /^[A-Z0-9]\w*/

const Template = {
  ReactComponent: (name: string) => `import React from 'react';

export const ${name}: React.FC<{}> = ({}) => {
  return (
    <div></div>
  );
}`
}

export const handler = async ({ feature, name }) => {
  if (!IsPascalCase.test(feature) || !IsPascalCase.test(name)) {
    print(`${red("Error".padStart(10))} Names of features and view files should be written in ${underline('PascalCase')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  try {
    await outputFile(Path.join(cwd, 'features', feature, 'View', `${name}.tsx`), Template.ReactComponent(name), { flag: 'wx' });
    await appendFile(Path.join(cwd, 'features', feature, 'View', 'index.tsx'), `\nexport { ${name} } from './${name}';\n`)
    print(`Created '${name}' in 'features/${feature}/View'\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      print(`${red("Error".padStart(10))} The file '${name}' already exists\n`)
    }
  }

};

export const command = ['view <feature> <name>', 'v'];
