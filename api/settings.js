const { kvGet, kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const settings = await kvGet('settings', 'settings.json') || {};
        return res.status(200).json(settings);
    } else if (req.method === 'POST') {
        // Admin saves settings
        const success = await kvSet('settings', req.body);
        if (success) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ success: false, error: 'Failed to save to KV' });
        }
    }
    res.status(405).send('Method Not Allowed');
};
