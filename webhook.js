const sqlite3 = require('sqlite3').verbose();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const DB = './netlify/functions/db.sqlite';

exports.handler = async function(event, context) {
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  let eventBody = event.body;
  try {
    let stripeEvent = eventBody;
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      stripeEvent = stripe.webhooks.constructEvent(eventBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      stripeEvent = JSON.parse(eventBody);
    }
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const db = new sqlite3.Database(DB);
      db.run('UPDATE orders SET status = ? WHERE stripe_session_id = ?', ['paid', session.id]);
    }
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
