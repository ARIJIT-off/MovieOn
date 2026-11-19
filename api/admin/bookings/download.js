// GET /api/admin/bookings/download
const XLSX = require('xlsx');
const { connectDB, Booking, cors, SNACK_NAMES, AUDI_LABELS } = require('../../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
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
};
