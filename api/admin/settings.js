const { kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        // Fallback for /api/admin/settings
        const success = await kvSet('settings', typeof req.body === "string" ? JSON.parse(req.body) : req.body);
        if (success) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ success: false, error: 'Failed to save to KV' });
        }
    }
    res.status(405).send('Method Not Allowed');
};

