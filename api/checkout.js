const { kvGet, kvSet } = require('./kv.js');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            let orders = await kvGet('orders', 'orders.json') || [];
            if (!Array.isArray(orders)) orders = [orders];
            
            const newOrder = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            newOrder.id = 1000 + orders.length;
            newOrder.date = new Date().toISOString();
            
            // If payment method is Visa, we set status to Pending Payment and initiate Paymob
            if (newOrder.paymentMethod === 'Visa') {
                newOrder.status = 'Pending Payment';
                
                const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
                const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
                const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

                if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Paymob is not configured yet. Please use COD for now or configure Vercel Environment Variables.' 
                    });
                }

                try {
                    // 1. Get Auth Token
                    const authReq = await fetch('https://accept.paymob.com/api/auth/tokens', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ api_key: PAYMOB_API_KEY })
                    });
                    const authRes = await authReq.json();
                    const authToken = authRes.token;

                    // 2. Register Order
                    const amountCents = Math.round(parseFloat(newOrder.total) * 100);
                    const orderReq = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            auth_token: authToken,
                            delivery_needed: "false",
                            amount_cents: amountCents.toString(),
                            currency: "EGP",
                            items: [], // Passing empty items for now to avoid validation issues with Paymob schema
                            merchant_order_id: `Laced-${newOrder.id}-${Date.now()}`
                        })
                    });
                    const orderRes = await orderReq.json();
                    const paymobOrderId = orderRes.id;
                    
                    // Save paymob order ID to our DB for webhook verification later
                    newOrder.paymobOrderId = paymobOrderId;

                    // 3. Get Payment Key
                    const paymentKeyReq = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            auth_token: authToken,
                            amount_cents: amountCents.toString(),
                            expiration: 3600,
                            order_id: paymobOrderId,
                            billing_data: {
                                apartment: "NA",
                                email: "customer@laced-store.com", // Paymob requires an email
                                floor: "NA",
                                first_name: newOrder.customer.name.split(' ')[0] || "Customer",
                                street: newOrder.customer.address || "NA",
                                building: "NA",
                                phone_number: newOrder.customer.phone || "NA",
                                shipping_method: "NA",
                                postal_code: "NA",
                                city: newOrder.customer.city || "Cairo",
                                country: "EG",
                                last_name: newOrder.customer.name.split(' ').slice(1).join(' ') || "Laced",
                                state: "NA"
                            },
                            currency: "EGP",
                            integration_id: PAYMOB_INTEGRATION_ID
                        })
                    });
                    const paymentKeyRes = await paymentKeyReq.json();
                    const paymentKey = paymentKeyRes.token;

                    // Save order in our DB before redirecting
                    orders.push(newOrder);
                    await kvSet('orders', orders);

                    // 4. Return Iframe URL
                    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
                    return res.status(200).json({ 
                        success: true, 
                        orderId: newOrder.id,
                        paymobUrl: iframeUrl
                    });

                } catch (paymobError) {
                    console.error("Paymob Error:", paymobError);
                    return res.status(500).json({ success: false, error: 'Error connecting to Paymob.' });
                }
            } else {
                // Regular Orders (COD, Instapay, E-wallet)
                newOrder.status = 'Pending';
                orders.push(newOrder);
                const success = await kvSet('orders', orders);
                if (success) {
                    return res.status(200).json({ success: true, orderId: newOrder.id });
                } else {
                    return res.status(500).json({ success: false, error: 'Failed to save to KV' });
                }
            }
        } catch(e) {
            console.error(e);
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    res.status(405).send('Method Not Allowed');
};
