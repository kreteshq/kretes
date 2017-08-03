const cwd = process.cwd();

const dbConfig = require(`${cwd}/config/database.json`);
const client = dbConfig.client || 'sqlite3';
const connection = dbConfig[process.env.HUNCWOT_ENV || 'development'];

const db = require('knex')({ client, connection });

module.exports = db;
