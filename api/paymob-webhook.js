const { kvGet, kvSet } = require('./kv.js');
const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const body = req.body;
            
            // Basic validation
            if (!body || !body.obj || !body.obj.order) {
                return res.status(400).send('Invalid Paymob Webhook format');
            }
            
            const paymobOrderId = body.obj.order.id;
            const success = body.obj.success;
            const amountCents = body.obj.amount_cents;
            
            // Get orders from DB
            let orders = await kvGet('orders', 'orders.json') || [];
            if (!Array.isArray(orders)) orders = [orders];
            
            // Find the order
            const orderIndex = orders.findIndex(o => String(o.paymobOrderId) === String(paymobOrderId));
            
            if (orderIndex !== -1) {
                if (success === true || success === "true") {
                    orders[orderIndex].status = 'Paid (Visa)';
                } else {
                    orders[orderIndex].status = 'Payment Failed';
                }
                
                await kvSet('orders', orders);
                return res.status(200).send('Webhook received and order updated.');
            } else {
                return res.status(404).send('Order not found in our database.');
            }

        } catch(e) {
            console.error('Paymob Webhook Error:', e);
            return res.status(500).send('Webhook processing error');
        }
    } else if (req.method === 'GET') {
        // Paymob also redirects the user back to a GET callback URL
        // We will just redirect them to a success or failure page
        const success = req.query.success;
        if (success === 'true') {
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Payment Successful</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9f9f9; text-align: center; margin: 0; }
                        .box { background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                        h1 { color: #25D366; }
                        a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h1>Payment Successful!</h1>
                        <p>Your payment was securely processed by Paymob.</p>
                        <p>We have received your order and will prepare it shortly.</p>
                        <a href="/index.html">Back to Store</a>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Payment Failed</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9f9f9; text-align: center; margin: 0; }
                        .box { background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                        h1 { color: #ff3333; }
                        a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h1>Payment Failed</h1>
                        <p>Unfortunately, your payment could not be processed.</p>
                        <p>Please try again with a different card or choose Cash on Delivery.</p>
                        <a href="/checkout.html">Try Again</a>
                    </div>
                </body>
                </html>
            `);
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
