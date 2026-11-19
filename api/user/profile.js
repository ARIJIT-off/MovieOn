// GET & PUT /api/user/profile
const { connectDB, User, cors } = require('../_db');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: 'Email required' });
      const user = await User.findOne({ email: email.toLowerCase() });
      return res.json(user || { email, phone: null, name: null });
    }

    if (req.method === 'PUT') {
      const { email, phone, name } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { phone, name },
        { new: true, upsert: true }
      );
      return res.json({ success: true, user });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
