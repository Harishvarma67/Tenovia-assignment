const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./customersdb.db');

// Create the customers table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS customersdb (ID INTEGER PRIMARY KEY, Name TEXT, Email TEXT, PhoneNumber TEXT, Address TEXT)");
});

module.exports = db;
