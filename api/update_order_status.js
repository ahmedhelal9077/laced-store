const { kvGet, kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body; const { orderId, status } = body;
            let orders = await kvGet('orders', 'orders.json') || [];
            if (!Array.isArray(orders)) orders = [orders];
            
            let found = false;
            for (let o of orders) {
                if (String(o.id) === String(orderId)) {
                    o.status = status;
                    found = true;
                    break;
                }
            }
            
            if (found) {
                const success = await kvSet('orders', orders);
                if (success) return res.status(200).json({ success: true });
            }
            return res.status(500).json({ success: false, error: 'Order not found or save failed' });
        } catch(e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    res.status(405).send('Method Not Allowed');
};

