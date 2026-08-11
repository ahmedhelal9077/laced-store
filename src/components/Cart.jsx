import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const Cart = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, getCartTotal } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Call our Vercel Serverless Function to initiate Paymob checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Paymob payment page
        window.location.href = data.url;
      } else {
        alert('Checkout failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.warn('API error (likely local dev mode):', error);
      alert('Local Dev Mode: Redirecting to Paymob Mock...');
      setTimeout(() => {
        window.location.href = "https://accept.paymob.com/standalone/?ref=mock_test_payment_link";
      }, 1000);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              zIndex: 40
            }}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed', top: 0, right: 0, width: '400px', maxWidth: '100%', height: '100%',
              background: '#111', color: 'white', zIndex: 50,
              display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
              <h2 className="brand-font" style={{ fontSize: '2rem', margin: 0 }}>CART</h2>
              <button onClick={toggleCart} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={28} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {cart.length === 0 ? (
                <p style={{ opacity: 0.6, textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.color}`} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem' }}>
                    {/* Tiny representation of color */}
                    <div style={{ width: '60px', height: '60px', background: item.color, borderRadius: '8px', border: '1px solid #444' }} />
                    
                    <div style={{ flex: 1 }}>
                      <h3 className="brand-font" style={{ fontSize: '1.2rem', margin: 0 }}>{item.name}</h3>
                      <p style={{ margin: '0.2rem 0', opacity: 0.8 }}>{item.price}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#222', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>
                          <button onClick={() => updateQuantity(item.id, item.color, -1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.color)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '2rem', borderTop: '1px solid #333', background: '#0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>TOTAL</span>
                  <span>${getCartTotal(useCartStore.getState()).toFixed(2)} USD</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut}
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                >
                  {isCheckingOut ? 'Processing...' : (
                    <>
                      <CreditCard size={20} />
                      Checkout (Paymob)
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
