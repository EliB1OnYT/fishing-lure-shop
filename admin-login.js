const jwt = require('jsonwebtoken');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  const { password } = JSON.parse(event.body || '{}');
  if (password && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin:true }, JWT_SECRET, { expiresIn: '7d' });
    return { statusCode: 200, body: JSON.stringify({ token }) };
  }
  return { statusCode: 401, body: JSON.stringify({ error: 'Invalid' }) };
};
