// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { outputFile, readFile } from 'fs-extra';
import Path from 'path';
import { bold, red, underline } from 'colorette';
import { Argv } from 'yargs';

import { print, interpolate } from '../../util'

const IsLowerCase = /^[a-z0-9]\w*/
const BCFUD = ['browse', 'fetch', 'create', 'update', 'delete'];

export const handler = async ({ name, action }: { name: string, action: string }) => {
  if (!IsLowerCase.test(name)) {
    print(`${red("Error".padStart(10))} Controller names should be ${underline('lower-case')}\n`)
    process.exit(1);
  }

  const cwd = process.cwd();
  const templateDir = Path.join(Path.resolve(__dirname, '..', '..', '..'), 'template', 'cli');
  const content = await readFile(Path.join(templateDir, 'controller.template.ts'), 'utf-8');

  const toGenerate = action === 'all' ? BCFUD : [action]

  for (let action of toGenerate) {
    try {
      const interpolated = interpolate(content, { action });

      await outputFile(Path.join(cwd, 'site', '_api', name, `${action}.ts`), interpolated, { flag: 'wx' });
      print(`Created ${underline(action)} in ${underline(`site/_api/${name}`)}\n`);
    } catch (error) {
      if (error.code === 'EEXIST') {
        print(`${red("Error".padStart(10))} The file '${action}' already exists\n`)
      } else {
        console.error(error.message)
      }
    }
  }
};

export const command = 'controller <name> [action]';
export const builder = (_: Argv) => _
  .positional("action", {
    default: 'all',
    choices: ['all', ...BCFUD],
  });

