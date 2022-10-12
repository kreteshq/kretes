import { IAction } from "cliffy";
import * as path from 'path';
import * as fs from 'fs';

export const action: IAction = async (options, name?: string) => {
  console.log(
    `\n%c 🦋 Kretes %c`,
    'background-color: #60A5FA; color: black; font-weight: bold',
    '',
  );
  console.log(
    'A programming environment for %cTypeScript%c & Deno\n',
    'color: #60A5FA',
    '',
  );

  const projectName = name || 'my-kretes-project';
  const projectPath = path.resolve(projectName);

  try {
    const dir = [...Deno.readDirSync(projectPath)];
    const isEmpty = dir.length === 0 ||
      dir.length === 1 && dir[0].name === '.git';
    if (!isEmpty) {
      error('Directory is not empty.');
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  await Deno.mkdir(projectName, { recursive: true });

  for (const el of InitTemplate) {
    await download(template(el), path.join(projectName, el));
  }

  if (options.vscode) {
    await Deno.mkdir(path.join(projectPath, '.vscode'), { recursive: true });

    const VSCodeSettings = {
      'deno.enable': true,
      'deno.lint': true,
      'editor.defaultFormatter': 'denoland.vscode-deno',
    };

    await Deno.writeTextFile(
      path.join(projectPath, '.vscode', 'settings.json'),
      JSON.stringify(VSCodeSettings, null, 2) + '\n',
    );

    const VSCodeExtensions = {
      recommendations: ['denoland.vscode-deno'],
    };

    await Deno.writeTextFile(
      path.join(projectPath, '.vscode', 'extensions.json'),
      JSON.stringify(VSCodeExtensions, null, 2) + '\n',
    );
  }

  console.log('\n%cProject initialized and ready.\n', 'color: green; font-weight: bold');
  console.log(
    `Enter the project directory using %ccd ${projectName}%c.`,
    'color: cyan',
    '',
  );
  console.log(
    'Run %ckretes start%c or %cdeno task start%c to start the project. %cCTRL-C%c to stop.',
    'color: cyan',
    '',
    'color: cyan',
    '',
    'color: cyan',
    '',
  );
}


const template = (element: string) =>
  `https://raw.githubusercontent.com/kreteshq/init/main/${element}`;

const InitTemplate = [
  'components/.gitkeep',
  'routes/index.page.tsx',
  'routes/posts.ts',
  'static/.gitkeep',
  '.gitignore',
  'deno.json',
  'import_map.json',
  'main.ts'
];

const download = async (url: string, path: string) => {
  const response = await fetch(url);
  const text = await response.text()

  await fs.ensureFile(path);

  Deno.writeTextFile(path, text);
};

const error = (message: string) => {
  console.error(`%cerror%c: ${message}`, 'color: red; font-weight: bold', '');
  Deno.exit(1);
};