const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_SXF85KUUEBsHkt',
  key_secret: 'O8CCwxNG7Sw2J6euyez5SeQu'
});

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least ₹1 (100 paise)' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: receipt || `MOV_${Date.now()}`,
      notes: notes || {}
    });

    console.log(`✅ Order created: ${order.id} — ₹${(amount / 100).toFixed(2)}`);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('❌ Order creation failed:', err.message);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};
