const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../../database/banco.db'));

db.pragma('foreign_keys = ON');

const runMigrations = require('./migrate');
runMigrations(db);

module.exports = db;