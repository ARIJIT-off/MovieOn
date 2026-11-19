// POST /api/auth/send-otp
const nodemailer = require('nodemailer');
const { connectDB, Admin, OTP, cors } = require('./_db');

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function sendOTPEmail(email, otp, role = 'user') {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
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

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();

    if (role === 'admin') {
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
    console.error('Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};
