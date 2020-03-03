const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const prettier = require('prettier');

const mainPackageJson = require('../package.json');

/**
 * @param {string} templatePath
 */
function setVersionInTemplate(templatePath) {
  const packagePath = join(templatePath, 'package.json');

  const pkg = JSON.parse(readFileSync(packagePath, { encoding: 'utf-8' }));
  pkg.dependencies.huncwot = `^${mainPackageJson.version}`;
  const text = prettier.format(JSON.stringify(pkg), { filepath: packagePath, ...mainPackageJson.prettier });

  writeFileSync(packagePath, text, { encoding: 'utf-8' });
}

setVersionInTemplate(join(__dirname, '../template/base'));
