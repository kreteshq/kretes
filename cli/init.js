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

    const packageJSON = join(cwd, dir, 'package.json');
    await fs.outputJson(packageJSON, generatePackageJSON(dir, dbengine), {
      spaces: 2
    });

    const sql = join(cwd, dir, 'db', 'tasks.sql');
    await fs.outputFile(sql, generateSQL(name));

    // static files
    await fs.copyAsync(themeDir, join(cwd, dir));

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
function generatePackageJSON(name, dbengine) {
  const dependencies = {
    'apollo-cache-inmemory': '^1.3.0-beta.6',
    'apollo-client': '^2.3.7',
    'apollo-link-http': '^1.5.4',
    axios: '^0.18.0',
    graphql: '^0.13.2',
    'graphql-tag': '^2.9.2',
    huncwot: '^0.22.0',
    knex: '^0.15.2',
    sqlite3: '^4.0.2',
    validate: '^4.4.1',
    vue: '^2.5.16',
    'vue-apollo': '^3.0.0-beta.19',
    'vue-router': '^3.0.1',
    vuex: '^3.0.1'
  };

  const devDependencies = {
    '@types/node': '^10.5.4',
    'babel-core': '^6.26.3',
    'babel-loader': '^7.1.5',
    'babel-preset-env': '^1.7.0',
    'babel-preset-stage-3': '^6.24.1',
    concurrently: '^3.6.1',
    'cross-env': '^5.2.0',
    'css-loader': '^1.0.0',
    'file-loader': '^1.1.11',
    'friendly-errors-webpack-plugin': '^1.7.0',
    'html-webpack-plugin': '^3.2.0',
    'node-sass': '^4.9.2',
    nodemon: '^1.18.3',
    'sass-loader': '^7.0.3',
    typescript: '^2.9.2',
    'vue-loader': '^15.2.6',
    'vue-style-loader': '^4.1.1',
    'vue-template-compiler': '^2.5.16',
    webpack: '4.16.3',
    'webpack-cli': '^3.1.0',
    'webpack-dev-server': '^3.1.5',
    'webpack-merge': '^4.1.3'
function generateDatabaseConfig(database) {
  return {
    development: {
      client: 'pg',
      host: 'localhost',
      port: 5432,
      database
    },
    test: {
      client: 'pg',
      host: 'localhost',
      port: 5432,
      database
    },
    production: {
      client: 'pg',
      host: 'localhost',
      port: 5432,
      database
    }
  };
}


  const browserslist = ['> 1%', 'last 2 versions', 'not ie <= 8'];

  const scripts = {
    client:
      'webpack-dev-server --mode development --open --config config/webpack.dev.js',
    build: 'webpack --progress --hide-modules --config config/webpack.prod.js',
    server: 'huncwot server',
    'watch-ts': 'tsc -w',
    start:
      'concurrently -k -p "[{name}]" -n "Client,TypeScript,Server" -c "yellow.bold,cyan.bold,green.bold" "yarn run client" "yarn run watch-ts" "yarn run server"'
  };

  return {
    name,
    version: '0.0.1',
    scripts,
    dependencies,
    devDependencies,
    browserslist
  };
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
