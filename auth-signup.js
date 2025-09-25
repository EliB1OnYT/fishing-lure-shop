const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DB = './netlify/functions/db.sqlite';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: 'Missing' }) };
  const hashed = bcrypt.hashSync(password, 8);
  const db = new sqlite3.Database(DB);
  return new Promise((resolve) => {
    db.run('INSERT INTO users (email, password) VALUES (?,?)', [email, hashed], function(err) {
      if (err) return resolve({ statusCode: 400, body: JSON.stringify({ error: 'User exists or invalid' }) });
      const token = jwt.sign({ id: this.lastID, email, isAdmin:false }, JWT_SECRET, { expiresIn: '7d' });
      resolve({ statusCode: 200, body: JSON.stringify({ token }) });
    });
  });
};
