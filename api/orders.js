const { kvGet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const orders = await kvGet('orders', 'orders.json') || [];
        return res.status(200).json(orders);
    }
    res.status(405).send('Method Not Allowed');
};
