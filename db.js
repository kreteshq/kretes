const cwd = process.cwd();

const dbConfig = require(`${cwd}/config/database.json`);
const connection = dbConfig[process.env.HUNCWOT_ENV || 'development'];
const client = connection.client || 'sqlite3';

const db = require('knex')({ client, connection });

module.exports = db;
