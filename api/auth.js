const { kvGet } = require('./kv.js');

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const reqBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const settings = await kvGet('settings', 'settings.json') || {};
            const validPassword = settings.adminPassword || 'admin123';
            
            if (reqBody.password === validPassword) {
                return res.status(200).json({ success: true, token: 'auth-ok' });
            } else {
                return res.status(401).json({ success: false });
            }
        }
        res.status(405).send('Method Not Allowed');
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
};