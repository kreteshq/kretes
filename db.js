const cwd = process.cwd();

const dbConfig = require(`${cwd}/config/database.json`);
const connection = dbConfig[process.env.HUNCWOT_ENV || 'development'];

const db = require('knex')({
  client: 'pg',
  connection
});

module.exports = db;
