const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DB = './netlify/functions/db.sqlite';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: 'Missing' }) };
  const db = new sqlite3.Database(DB);
  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err || !row) return resolve({ statusCode: 400, body: JSON.stringify({ error: 'Invalid' }) });
      const ok = bcrypt.compareSync(password, row.password);
      if (!ok) return resolve({ statusCode: 400, body: JSON.stringify({ error: 'Invalid' }) });
      const token = jwt.sign({ id: row.id, email, isAdmin:false }, JWT_SECRET, { expiresIn: '7d' });
      resolve({ statusCode: 200, body: JSON.stringify({ token }) });
    });
  });
};
