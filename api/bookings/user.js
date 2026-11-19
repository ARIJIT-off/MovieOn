// GET /api/bookings/user
const { connectDB, Booking, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const bookings = await Booking.find({ bookedByEmail: email.toLowerCase() }).sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
