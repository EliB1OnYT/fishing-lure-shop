const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const DB_PATH = './netlify/functions/db.sqlite';

function init() {
  if (!fs.existsSync(DB_PATH)) {
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, price REAL)`);
      db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, stripe_session_id TEXT, amount INTEGER, status TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`INSERT INTO products (title, description, price) VALUES ('Classic Spoon', 'Shiny spoon lure', 9.99), ('Topwater Popper', 'Surface action popper', 14.99)`);
    });
    db.close();
  }
}
init();
exports.handler = async function(event, context){ return { statusCode: 200, body: 'OK' }; };
