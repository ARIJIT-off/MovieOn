// GET /api/health
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: 'MOViEON Serverless v2.0 running', platform: 'vercel' });
};
