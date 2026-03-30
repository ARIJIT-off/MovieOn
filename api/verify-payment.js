const crypto = require('crypto');

const KEY_SECRET = 'O8CCwxNG7Sw2J6euyez5SeQu';

module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated === razorpay_signature) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`);
      res.status(200).json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      console.warn('⚠️  Signature mismatch');
      res.status(400).json({ verified: false, error: 'Signature verification failed' });
    }
  } catch (err) {
    console.error('❌ Verification error:', err.message);
    res.status(500).json({ verified: false, error: err.message });
  }
};
