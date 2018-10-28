// Copyright 2018 Zaiste & contributors. All rights reserved.
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
const { spawn } = require('child_process');

const cwd = process.cwd();

async function init({ dir }) {
  const themeDir = join(resolve(__dirname, '..'), 'template');

  const name = dir.replace(/-/g, '_');

  try {
    console.log(`Initialising '${dir}'...`);
    // Info about PostgreSQL client running instead ?
    console.log('Database engine: ');

    // dynamic files
    const databaseConfig = join(cwd, dir, 'config', 'database.json');
    await fs.outputJson(databaseConfig, generateDatabaseConfig(name), {
      spaces: 2
    });

    const sql = join(cwd, dir, 'db', 'tasks.sql');
    await fs.outputFile(sql, generateSQL(name));

    // static files
    await fs.copyAsync(themeDir, join(cwd, dir));

    // Overwrites `package.json` copied above
    const path = join(cwd, dir, 'package.json');
    const content = generatePackageJSON(dir);
    await fs.outputJson(path, content, { spaces: 2 });

    const isYarnInstalled = await hasbin('yarn');

    if (isYarnInstalled) {
      spawn('yarn', { cwd: dir, stdio: 'inherit' });
    } else {
      console.error(
        '\nError: `yarn` is not installed. Please check their installation guide at https://yarnpkg.com/en/docs/install to learn how to install `yarn` on your platform'
      );
    }
  } catch (error) {
    console.log('error: ' + error.message);
  }
}

async function hasbin(name) {
  return await Promise.resolve(
    process.env.PATH.split(delimiter).map(_ => join(_, name))
  )
    .map(exists)
    .reduce((a, b) => a || b);
}

async function exists(pathname) {
  try {
    await fs.accessAsync(pathname);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  handler: init,
  builder: _ => _.default('dir', '.')
};

// TODO: generalize this function as ~ `generate(...)`
function generateDatabaseConfig(database) {
  return {
    development: {
      host: 'localhost',
      port: 5432,
      database
    },
    test: {
      host: 'localhost',
      port: 5432,
      database
    },
    production: {
      host: 'localhost',
      port: 5432,
      database
    }
  };
}

function generatePackageJSON(name) {
  const content = require('../template/package.json');
  const result = Object.assign({ name, version: '0.0.1' }, content);

  return result;
}

function generateSQL(name, dbengine) {
  switch (dbengine) {
    case 'postgresql':
      return `DROP DATABASE IF EXISTS ${name}_dev;
CREATE DATABASE ${name}_dev;

\\c ${name}_dev;

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  done BOOLEAN
);

INSERT INTO tasks (name, done)
VALUES
    ('Share the love about Huncwot', false),
    ('Build a fantastic web application', false),
    ('Give back to the community', false);
`;
  }
}
