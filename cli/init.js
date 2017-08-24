// Copyright 2016 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const { join, resolve, delimiter } = require('path');
const exec = require('child_process').exec;

const cwd = process.cwd();

async function init({ dir, dbengine }) {
  const themeDir = join(resolve(__dirname, '..'), 'template');

  try {
    console.log(`Initialising '${dir}'...`);
    console.log(`Database engine: '${dbengine}'`);

    // dynamic files
    const databaseConfig = join(cwd, dir, 'config', 'database.json');
    await fs.outputJson(databaseConfig, generateDatabaseConfig(dir), { spaces: 2 });

    const packageJSON = join(cwd, dir, 'package.json');
    await fs.outputJson(packageJSON, generatePackageJSON(dir, dbengine), { spaces: 2 });

    await fs.ensureFile(join(cwd, dir, 'db', 'development.sqlite3'))
    await fs.ensureFile(join(cwd, dir, 'db', 'test.sqlite3'))
    await fs.ensureFile(join(cwd, dir, 'db', 'production.sqlite3'))

    // static files
    await fs.copyAsync(themeDir, join(cwd, dir));

    const isYarnInstalled = await hasbin('yarn');

    if (isYarnInstalled) {
      exec(`yarn`, { cwd: dir }).stdout.pipe(process.stdout);
      console.log('done');
    } else {
      console.error('\nError: `yarn` is not installed. Please check their installation guide at https://yarnpkg.com/en/docs/install to learn how to install `yarn` on your platform');
    }
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

async function hasbin(name) {
  return await Promise.resolve(process.env.PATH.split(delimiter).map(_ => join(_, name)))
    .map(exists)
    .reduce((a, b) => a || b)
}

async function exists(pathname) {
  try {
    await fs.accessAsync(pathname);
    return true
  } catch (error) {
    return false;
  }
}

module.exports = {
  handler: init,
  builder: _ => _
    .option('dbengine', { alias: 'd', default: 'sqlite3' })
    .default('dir', '.')
};

// TODO: generalize this function as ~ `generate(...)`
function generateDatabaseConfig(database, dbengine) {
  switch (dbengine) {
    case 'postgresql':
      return {
        client: "pg",
        development: { host: "localhost", port: 5432, database },
        test: { host: "localhost", "port": 5432, database },
        production: { host: "localhost", port: 5432, database }
      }
    default:
      return {
        client: "sqlite3",
        development: { filename: "./db/development.sqlite3" },
        test: { filename: "./db/test.sqlite3" },
        production: { filename: "./db/production.sqlite3" },
      }
  }
}

function generatePackageJSON(name, dbengine) {
  const dependencies = {
    "huncwot": "latest",
    "lasso": "latest",
    "lasso-marko": "latest",
    "marko": "latest",
    "marko-path-router": "latest",
    "redux": "latest",
    "knex": "latest",
  }

  switch (dbengine) {
    case 'postgresql':
      Object.assign(dependencies, { "pg": "latest" });
      break;
    default:
      Object.assign(dependencies, { "sqlite3": "latest" })
      break;
  }


  return { name, version: "0.0.1", dependencies }
}
