const pg = require('pg-promise')()
const cwd = process.cwd();

const dbConfig = require(`${cwd}/config/database.json`);
const db = pg(dbConfig[process.env.HUNCWOT_ENV || 'development']);

module.exports = db;
