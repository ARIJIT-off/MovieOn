// POST /api/bookings/create
const { connectDB, Booking, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const {
      bookingId, movieId, movieName, date, showtime,
      audiId, audiName, seats, seatTotal, foodItems,
      foodTotal, convenienceFee, grandTotal,
      bookedByEmail, bookedByPhone, paymentMethod, paymentId
    } = req.body;

    // Check if seats are still available
    const conflict = await Booking.findOne({
      movieId: Number(movieId), date, showtime,
      audiId: Number(audiId),
      status: { $ne: 'cancelled' },
      seats: { $in: seats }
    });

    if (conflict) {
      return res.status(409).json({ error: 'Some seats have just been booked. Please re-select.' });
    }

    // Ensure unique bookingId
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
};
