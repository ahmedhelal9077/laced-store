const { kvGet, kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            let orders = await kvGet('orders', 'orders.json') || [];
            if (!Array.isArray(orders)) orders = [orders];
            
            const newOrder = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            newOrder.id = 1000 + orders.length;
            newOrder.date = new Date().toISOString();
            newOrder.status = 'Pending';
            
            orders.push(newOrder);
            
            const success = await kvSet('orders', orders);
            if (success) {
                return res.status(200).json({ success: true, orderId: newOrder.id });
            } else {
                return res.status(500).json({ success: false, error: 'Failed to save to KV' });
            }
        } catch(e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    res.status(405).send('Method Not Allowed');
};

