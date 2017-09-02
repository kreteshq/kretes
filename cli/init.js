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

  const name = dir.replace(/-/g, "_");

  try {
    console.log(`Initialising '${dir}'...`);
    console.log(`Database engine: '${dbengine}'`);

    // dynamic files
    const databaseConfig = join(cwd, dir, 'config', 'database.json');
    await fs.outputJson(databaseConfig, generateDatabaseConfig(name), { spaces: 2 });

    const packageJSON = join(cwd, dir, 'package.json');
    await fs.outputJson(packageJSON, generatePackageJSON(dir, dbengine), { spaces: 2 });

    const sql = join(cwd, dir, 'db', 'tasks.sql');
    await fs.outputFile(sql, generateSQL(name, dbengine));

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
        development: {
          client: "pg",
          host: "localhost", port: 5432, database
        },
        test: {
          client: "pg",
          host: "localhost", "port": 5432, database
        },
        production: {
          client: "pg",
          host: "localhost", port: 5432, database
        }
      }
    default:
      return {
        development: {
          client: "sqlite3",
          filename: "./db/development.sqlite3"
        },
        test: {
          client: "sqlite3",
          filename: "./db/test.sqlite3"
        },
        production: {
          client: "sqlite3",
          filename: "./db/production.sqlite3"
        },
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
    "mobx": "latest",
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

function generateSQL(name, dbengine) {
  switch (dbengine) {
    case 'postgresql':
      return `DROP DATABASE IF EXISTS ${name}_dev;
CREATE DATABASE ${name}_dev;

\\c ${name}_dev;

CREATE TABLE tasks (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  done BOOLEAN
);

INSERT INTO tasks (name, done)
VALUES
    ('Share the love about Huncwot', false),
    ('Build a fantastic web application', false),
    ('Give back to the community', false);
`;
    case 'sqlite3':
      return `CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  done INTEGER
);

INSERT INTO tasks (name, done)
VALUES
    ('Share the love about Huncwot', 0),
    ('Build a fantastic web application', 0),
    ('Give back to the community', 0);
`;
  }
}
