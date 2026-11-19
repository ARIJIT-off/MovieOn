// POST /api/admin/add
const { connectDB, Admin, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { newEmail, requestedByEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: 'newEmail is required' });

    const normalizedNewEmail = newEmail.toLowerCase().trim();
    const normalizedRequester = (requestedByEmail || '').toLowerCase().trim();

    const requester = await Admin.findOne({ email: normalizedRequester });
    if (!requester) {
      return res.status(403).json({ error: 'Unauthorized: requester is not an admin' });
    }

    const existing = await Admin.findOne({ email: normalizedNewEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email is already an admin' });
    }

    const newAdmin = await Admin.create({ email: normalizedNewEmail, addedBy: normalizedRequester });
    res.json({ success: true, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
