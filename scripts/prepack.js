const { writeFileSync } = require('fs');
const { join } = require('path')
const { version } = require('../package.json');

const packagePath = join(__dirname, '../template/base/package.json')
const pkg = require(packagePath);

pkg.dependencies.huncwot = `^${version}`;
const content = JSON.stringify(pkg, null, 2) + "\n";
writeFileSync(packagePath, content, { encoding: 'utf-8' });
