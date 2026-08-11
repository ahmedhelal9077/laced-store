const { kvGet } = require('./kv.js');

module.exports = async (req, res) => {
    let products = await kvGet('products', 'js/data.js') || [];
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.status(200).send("const products = " + JSON.stringify(products) + ";");
};
