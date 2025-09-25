const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const DB = './netlify/functions/db.sqlite';
const JWT_SECRET = process.env.JWT_SECRET;

function verifyAdmin(authHeader) {
  if (!authHeader) return false;
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload && payload.isAdmin;
  } catch (e) { return false; }
}

exports.handler = async function(event, context) {
  if (!verifyAdmin(event.headers.authorization)) return { statusCode: 401, body: JSON.stringify({error:'Unauthorized'}) };
  const body = JSON.parse(event.body || '{}');
  const { title, description, price } = body;
  const db = new sqlite3.Database(DB);
  return new Promise((resolve) => {
    db.run('INSERT INTO products (title, description, price) VALUES (?,?,?)', [title, description, price], function(err) {
      if (err) return resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
      resolve({ statusCode: 200, body: JSON.stringify({ id: this.lastID }) });
    });
  });
};
