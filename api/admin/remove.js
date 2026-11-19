// DELETE /api/admin/remove
const { connectDB, Admin, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
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
};
