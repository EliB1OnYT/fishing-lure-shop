const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const sqlite3 = require('sqlite3').verbose();
const DB = './netlify/functions/db.sqlite';

exports.handler = async function(event, context) {
  try {
    const { items } = JSON.parse(event.body || '{}');
    if (!items || items.length === 0) return { statusCode: 400, body: JSON.stringify({ error: 'No items' }) };
    const line_items = items.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: { name: it.title },
        unit_amount: Math.round(it.price * 100)
      },
      quantity: it.qty
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:3000'}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:3000'}?canceled=true`
    });
    const db = new sqlite3.Database(DB);
    db.run('INSERT INTO orders (stripe_session_id, amount, status) VALUES (?,?,?)', [session.id, session.amount_total || 0, 'created']);
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
