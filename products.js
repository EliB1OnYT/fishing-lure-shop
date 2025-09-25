const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./netlify/functions/db.sqlite');

exports.handler = async function(event, context) {
  return new Promise((resolve) => {
    db.all('SELECT * FROM products ORDER BY id DESC', (err, rows) => {
      if (err) return resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
      resolve({ statusCode: 200, body: JSON.stringify(rows) });
    });
  });
};
