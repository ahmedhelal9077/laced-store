const { kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const success = await kvSet('products', body);
            if (success) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(500).json({ success: false });
            }
        } catch(e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    res.status(405).send('Method Not Allowed');
};
