// GET /api/admin/bookings
const { connectDB, Booking, cors } = require('../../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { period } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];

    let filter = {};
    if (period === 'previous') {
      filter = { date: { $lt: todayStr } };
    } else if (period === 'upcoming') {
      filter = { date: { $gte: todayStr } };
    }

    const bookings = await Booking.find(filter).sort({ date: period === 'previous' ? -1 : 1, showtime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
