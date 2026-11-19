// ═══════════════════════════════════════════════════════════════
// Shared MongoDB connection + Mongoose models for Vercel Serverless
// Reused across all /api/* functions
// ═══════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
  });
  isConnected = true;
}

// ── Schemas ──────────────────────────────────────────────────

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

// Prevent model recompilation in serverless (hot module cache)
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// ── CORS Helper ──────────────────────────────────────────────
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ── Snack / Audi Labels ──────────────────────────────────────
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

module.exports = {
  connectDB, Admin, User, OTP, Booking,
  cors, SNACK_NAMES, AUDI_LABELS
};
