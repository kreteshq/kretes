// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { outputFile, readFile } from 'fs-extra';
import Path from 'path';
import { red, underline } from 'colorette';

import { print, interpolate } from '../../util'

const IsPascalCase = /^[A-Z0-9]\w*/
const BCFUD = ['browse', 'fetch', 'create', 'update', 'delete'];

export const handler = async ({ feature, action }: { feature: string, action: string }) => {
  if (!IsPascalCase.test(feature)) {
    print(`${red("Error".padStart(10))} Names of files for features should be written in ${underline('PascalCase')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  const templateDir = Path.join(Path.resolve(__dirname, '..', '..', '..'), 'template', 'cli');
  const content = await readFile(Path.join(templateDir, 'controller.template.ts'), 'utf-8');

  const toGenerate = action === 'all' ? BCFUD : [action]

  for (let action of toGenerate) {
    try {
      const interpolated = interpolate(content, { action });
      await outputFile(Path.join(cwd, 'features', feature, 'controller', `${action}.ts`), interpolated, { flag: 'wx' });
      print(`Created '${action}' in 'features/${feature}/view'\n`);
    } catch (error) {
      if (error.code === 'EEXIST') {
        print(`${red("Error".padStart(10))} The file '${action}' already exists\n`)
      } else {
        console.error(error.message)
      }
    }
  }
};

export const command = 'controller <feature> <action>';
export const builder = _ => _
  .positional("action", {
    choices: ["all", ...BCFUD],
  });

