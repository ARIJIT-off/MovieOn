// GET /api/ticket/qr
const QRCode = require('qrcode');
const { connectDB, Booking, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { bookingId } = req.query;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const qrText = booking.qrData || bookingId;
    const qrImage = await QRCode.toDataURL(qrText);
    res.json({ qrDataUrl: qrImage, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
