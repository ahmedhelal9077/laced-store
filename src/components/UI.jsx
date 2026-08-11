import React from 'react';
import { ShoppingCart, Search, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

const colors = [
  { name: 'Onyx Black', value: '#1a1a1a' },
  { name: 'Ghost White', value: '#f5f5f5' },
  { name: 'Crimson Red', value: '#8b0000' },
  { name: 'Neon Green', value: '#39ff14' }
];

export const UI = ({ activeColor, setActiveColor, products, activeIndex, setActiveIndex }) => {
  const currentProduct = products[activeIndex];
  const { toggleCart, addToCart, cart } = useCartStore();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="ui-container">
      <header className="pointer-events-auto">
        <div className="logo brand-font">LACED</div>
        <nav className="hidden md:block">
          <ul>
            <li><a href="#">New Arrivals</a></li>
            <li><a href="#">Men</a></li>
            <li><a href="#">Women</a></li>
            <li><a href="#">Collections</a></li>
          </ul>
        </nav>
        <div className="flex gap-4">
          <button className="btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <Search size={20} />
          </button>
          <button 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
            onClick={toggleCart}
          >
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5, 
                background: 'white', color: 'black', 
                fontSize: '0.7rem', fontWeight: 'bold', 
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Navigation Arrows */}
      <div className="pointer-events-auto" style={{
        position: 'absolute', top: '50%', left: 0, width: '100%', 
        display: 'flex', justifyContent: 'space-between', padding: '0 2rem',
        transform: 'translateY(-50%)', zIndex: 20
      }}>
        <button onClick={handlePrev} className="btn-outline" style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <ChevronLeft size={30} />
        </button>
        <button onClick={handleNext} className="btn-outline" style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <ChevronRight size={30} />
        </button>
      </div>

      <div className="product-info pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProduct.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="product-title brand-font">{currentProduct.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}</h1>
            <p className="product-price">{currentProduct.price}</p>
          </motion.div>
        </AnimatePresence>
        
        <div className="color-picker" style={{ marginTop: '2rem' }}>
          <span className="color-picker-label">Select Colorway</span>
          <div className="colors">
            {colors.map((color) => (
              <div
                key={color.name}
                className={`color-swatch ${activeColor === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value, border: activeColor === color.value ? '2px solid white' : '2px solid transparent' }}
                onClick={() => setActiveColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="actions">
          <button 
            className="btn btn-primary"
            onClick={() => addToCart(currentProduct, activeColor)}
          >
            Add to Cart
          </button>
          <button className="btn btn-outline">Details</button>
        </div>
      </div>
    </div>
  );
};
