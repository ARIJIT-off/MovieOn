// ═══════════════════════════════════════════════════════════════
// MOViEON — Serverless Backend for Vercel (Single Function)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const XLSX = require('xlsx');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

// ── Database Connection Cache ────────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not configured");
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
  });
  isConnected = true;
}

// Connect middleware on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

// ── Models ───────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  addedBy: { type: String, default: 'system' },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: null },
  name: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  movieId: { type: Number, required: true },
  movieName: { type: String, required: true },
  date: { type: String, required: true },
  showtime: { type: String, required: true },
  audiId: { type: Number, required: true },
  audiName: { type: String, required: true },
  seats: [{ type: String }],
  seatTotal: { type: Number, default: 0 },
  foodItems: { type: Object, default: {} },
  foodTotal: { type: Number, default: 0 },
  convenienceFee: { type: Number, default: 30 },
  grandTotal: { type: Number, required: true },
  bookedByEmail: { type: String, required: true, lowercase: true },
  bookedByPhone: { type: String, default: null },
  paymentMethod: { type: String, default: 'upi' },
  paymentId: { type: String, default: null },
  status: { type: String, default: 'confirmed' },
  qrData: { type: String, default: null },
  bookedAt: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// ── Seed Admin Helper ────────────────────────────────────────
async function ensureDefaultAdmin() {
  const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'ap2446961@gmail.com').toLowerCase();
  const exists = await Admin.findOne({ email: defaultEmail });
  if (!exists) {
    await Admin.create({ email: defaultEmail, addedBy: 'system' });
  }
}

// ── Helpers ──────────────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function sendOTPEmail(email, otp, role = 'user') {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const roleLabel = role === 'admin' ? 'Admin Portal' : 'MOViEON';
  await transporter.sendMail({
    from: `"MOViEON 🎬" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your ${roleLabel} Login OTP: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 480px; margin: auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; margin: 0; color: #fff;">MOViE<span style="color: #f97316;">ON</span></h1>
          <p style="color: #888; margin: 4px 0 0;">Premium Cinema Experience</p>
        </div>
        <div style="background: #1a1a2e; border-radius: 10px; padding: 32px; text-align: center;">
          <p style="color: #aaa; margin: 0 0 16px;">Your one-time login OTP for <strong style="color:#f97316;">${roleLabel}</strong>:</p>
          <div style="font-size: 48px; font-weight: 900; letter-spacing: 16px; color: #f97316; font-family: monospace; margin: 16px 0;">${otp}</div>
          <p style="color: #666; font-size: 13px; margin: 16px 0 0;">Valid for <strong>5 minutes</strong>. Do not share this OTP with anyone.</p>
        </div>
        <p style="color: #555; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
}

const SNACK_NAMES = {
  c1: "Classic Combo", c2: "Jumbo Combo", c3: "Nachos Combo",
  p1: "Salted Popcorn (S)", p2: "Salted Popcorn (M)", p3: "Salted Popcorn (L)",
  p4: "Caramel Popcorn (S)", p5: "Caramel Popcorn (M)", p6: "Caramel Popcorn (L)",
  b1: "Pepsi (500ml)", b2: "7UP (500ml)", b3: "Mountain Dew (500ml)",
  b4: "Aquafina Water (1L)", b5: "Cold Coffee",
  s1: "Nachos with Salsa", s2: "Hot Dog", s3: "Paneer Tikka Wrap", s4: "Brownie with Ice Cream"
};

const AUDI_LABELS = {
  1: "Audi 1 STD", 2: "Audi 2 STD+", 3: "Audi 3 REC"
};

// ── Routes ───────────────────────────────────────────────────

// Auth
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();
    if (role === 'admin') {
      await ensureDefaultAdmin();
      const adminRecord = await Admin.findOne({ email: normalizedEmail });
      if (!adminRecord) {
        return res.status(403).json({ error: 'not_registered', message: 'Your email id is not registered' });
      }
    }

    await OTP.deleteMany({ email: normalizedEmail });
    const otp = generateOTP();
    await OTP.create({ email: normalizedEmail, otp });
    await sendOTPEmail(normalizedEmail, otp, role);

    res.json({ success: true, message: `OTP sent to ${normalizedEmail}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });

    if (!otpRecord) {
      return res.status(401).json({ error: 'invalid_otp', message: 'Invalid or expired OTP' });
    }

    await OTP.deleteMany({ email: normalizedEmail });

    if (role === 'admin') {
      const adminRecord = await Admin.findOne({ email: normalizedEmail });
      if (!adminRecord) {
        return res.status(403).json({ error: 'not_registered', message: 'Your email id is not registered' });
      }
      return res.json({ success: true, role: 'admin', email: normalizedEmail });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({ email: normalizedEmail });
    }

    return res.json({ success: true, role: 'user', email: normalizedEmail, phone: user.phone, name: user.name });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
});

// Admin Management
app.get('/api/admin/list', async (req, res) => {
  try {
    await ensureDefaultAdmin();
    const admins = await Admin.find({}).sort({ addedAt: 1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/add', async (req, res) => {
  try {
    const { newEmail, requestedByEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: 'newEmail is required' });

    const normalizedNewEmail = newEmail.toLowerCase().trim();
    const normalizedRequester = (requestedByEmail || '').toLowerCase().trim();

    const requester = await Admin.findOne({ email: normalizedRequester });
    if (!requester) {
      return res.status(403).json({ error: 'Unauthorized: requester is not an admin' });
    }

    const existing = await Admin.findOne({ email: normalizedNewEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email is already an admin' });
    }

    const newAdmin = await Admin.create({ email: normalizedNewEmail, addedBy: normalizedRequester });
    res.json({ success: true, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/remove', async (req, res) => {
  try {
    const { emailToRemove, requestedByEmail } = req.body;
    const defaultAdmin = (process.env.DEFAULT_ADMIN_EMAIL || '').toLowerCase();
    const normalizedToRemove = (emailToRemove || '').toLowerCase().trim();
    const normalizedRequester = (requestedByEmail || '').toLowerCase().trim();

    if (normalizedToRemove === defaultAdmin) {
      return res.status(403).json({ error: 'Cannot remove the default admin' });
    }

    const requester = await Admin.findOne({ email: normalizedRequester });
    if (!requester) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Admin.deleteOne({ email: normalizedToRemove });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookings
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { period } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];

    let filter = {};
    if (period === 'previous') filter = { date: { $lt: todayStr } };
    else if (period === 'upcoming') filter = { date: { $gte: todayStr } };

    const bookings = await Booking.find(filter).sort({ date: period === 'previous' ? -1 : 1, showtime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/bookings/download', async (req, res) => {
  try {
    const { period } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];
    let filter = {};
    if (period === 'previous') filter = { date: { $lt: todayStr } };
    else if (period === 'upcoming') filter = { date: { $gte: todayStr } };

    const bookings = await Booking.find(filter).sort({ date: 1, showtime: 1 });

    const rows = bookings.map(b => {
      const snacks = Object.entries(b.foodItems || {})
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => `${SNACK_NAMES[id] || id} (${qty})`)
        .join(', ');

      const hall = AUDI_LABELS[b.audiId] || (b.audiName ? `${b.audiName}` : 'Audi 1 STD');

      return {
        'Date': b.date,
        'Movie Name': b.movieName,
        'Hall': hall,
        'Show Time': b.showtime,
        'Seats Booked': b.seats.join(', '),
        'Booked By': b.bookedByEmail,
        'Phone': b.bookedByPhone || 'N/A',
        'Ordered Snacks': snacks || 'None',
        'Order Amount (₹)': b.grandTotal,
        'Booking ID': b.bookingId,
        'Payment Method': b.paymentMethod,
        'Status': b.status
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, period === 'previous' ? 'Previous Bookings' : 'Upcoming Bookings');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename=movieon_${period}_bookings.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seats/booked', async (req, res) => {
  try {
    const { movieId, date, showtime, audiId } = req.query;
    const bookings = await Booking.find({
      movieId: Number(movieId),
      date,
      showtime,
      audiId: Number(audiId),
      status: { $ne: 'cancelled' }
    });

    const bookedSeats = [];
    bookings.forEach(b => bookedSeats.push(...b.seats));
    res.json({ bookedSeats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/create', async (req, res) => {
  try {
    const {
      bookingId, movieId, movieName, date, showtime,
      audiId, audiName, seats, seatTotal, foodItems,
      foodTotal, convenienceFee, grandTotal,
      bookedByEmail, bookedByPhone, paymentMethod, paymentId
    } = req.body;

    const conflict = await Booking.findOne({
      movieId: Number(movieId), date, showtime,
      audiId: Number(audiId),
      status: { $ne: 'cancelled' },
      seats: { $in: seats }
    });

    if (conflict) {
      return res.status(409).json({ error: 'Some seats have just been booked. Please re-select.' });
    }

    let finalBookingId = bookingId;
    if (!finalBookingId) {
      finalBookingId = `MOV-${new Date().getFullYear()}-KOL-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const existing = await Booking.findOne({ bookingId: finalBookingId });
    if (existing) {
      finalBookingId = `MOV-${new Date().getFullYear()}-KOL-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const qrData = JSON.stringify({ bookingId: finalBookingId, movie: movieName, date, showtime, seats, email: bookedByEmail });

    const booking = await Booking.create({
      bookingId: finalBookingId, movieId, movieName, date, showtime,
      audiId, audiName, seats, seatTotal, foodItems,
      foodTotal, convenienceFee, grandTotal,
      bookedByEmail, bookedByPhone, paymentMethod, paymentId,
      qrData, status: 'confirmed'
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/user', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const bookings = await Booking.find({ bookedByEmail: email.toLowerCase() }).sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tickets
app.get('/api/ticket/qr', async (req, res) => {
  try {
    const { bookingId } = req.query;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const qrText = booking.qrData || bookingId;
    const qrImage = await QRCode.toDataURL(qrText);
    res.json({ qrDataUrl: qrImage, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    res.json(user || { email, phone: null, name: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const { email, phone, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { phone, name },
      { new: true, upsert: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay
app.post('/api/create-order', async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

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

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated === razorpay_signature) {
      res.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Signature mismatch' });
    }
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'MOViEON Serverless Express running on Vercel', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

module.exports = app;
