// GET /api/seats/booked
const { connectDB, Booking, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
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
};
