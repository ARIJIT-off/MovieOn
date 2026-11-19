// POST /api/auth/verify-otp
const { connectDB, Admin, User, OTP, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
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
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
};
