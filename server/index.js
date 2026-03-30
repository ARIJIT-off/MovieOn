// ═══════════════════════════════════════════════════════════════
// MOViEON — Razorpay Payment Server
// Creates orders and verifies payment signatures
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ── Razorpay Instance (Test Keys) ────────────────────────────
const razorpay = new Razorpay({
  key_id: 'rzp_test_SXF85KUUEBsHkt',
  key_secret: 'O8CCwxNG7Sw2J6euyez5SeQu'
});

const KEY_SECRET = 'O8CCwxNG7Sw2J6euyez5SeQu';

// ── Create Order ─────────────────────────────────────────────
// POST /create-order  { amount: 35000 }  (amount in paise)
app.post('/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least ₹1 (100 paise)' });
    }

    const options = {
      amount: Math.round(amount),       // amount in paise
      currency: 'INR',
      receipt: receipt || `MOV_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    console.log(`✅ Order created: ${order.id} — ₹${(amount / 100).toFixed(2)}`);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('❌ Order creation failed:', err.message);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// ── Verify Payment Signature ─────────────────────────────────
// POST /verify-payment  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated === razorpay_signature) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`);
      res.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      console.warn('⚠️  Signature mismatch — possible tampering');
      res.status(400).json({ verified: false, error: 'Signature verification failed' });
    }
  } catch (err) {
    console.error('❌ Verification error:', err.message);
    res.status(500).json({ verified: false, error: err.message });
  }
});

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'MOViEON Payment Server is running', mode: 'TEST' });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = 4000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   MOViEON Payment Server                ║');
  console.log(`  ║   Running on http://localhost:${PORT}        ║`);
  console.log('  ║   Mode: RAZORPAY TEST                   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
