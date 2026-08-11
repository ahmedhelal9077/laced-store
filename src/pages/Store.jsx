import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { UI } from '../components/UI';
import { ShoeModel } from '../components/ShoeModel';
import { Cart } from '../components/Cart';
import { supabase } from '../lib/supabase';

export default function Store() {
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadProducts() {
      const DEFAULT_PRODUCTS = [
        { id: 1, name: 'Asics Gel-Kayano 14', price: '$160.00', type: 'runner', imageUrl: '/asics-kayano.jpg' },
        { id: 2, name: 'Adidas Campus 00s Grey', price: '$110.00', type: 'classic', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' }
      ];
      localStorage.setItem('laced_products', JSON.stringify(DEFAULT_PRODUCTS));
      setProducts(DEFAULT_PRODUCTS);
      setLoading(false);
    }
    
    loadProducts();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'black', color: 'white' }}>Loading LACED...</div>;
  }

  const currentProduct = products[activeIndex];
  const hasImage = !!currentProduct?.imageUrl;

  return (
    <>
      <UI 
        activeColor={activeColor} 
        setActiveColor={setActiveColor} 
        products={products}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
      
      <Cart />
      
      <div className="canvas-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e5e5e5' }}>
        {hasImage ? (
          <img 
            src={currentProduct.imageUrl} 
            alt={currentProduct.name} 
            style={{ maxWidth: '80%', maxHeight: '60vh', objectFit: 'contain', zIndex: 1, mixBlendMode: 'multiply' }} 
          />
        ) : (
          <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            
            <Suspense fallback={null}>
              <ShoeModel 
                color={activeColor} 
                type={currentProduct?.type || 'phantom'}
                position={[0, -0.5, 0]} 
              />
              <Environment preset="city" />
              <ContactShadows position={[0, -0.9, 0]} opacity={0.6} scale={10} blur={2} far={4} />
            </Suspense>
            
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 2.5}
            />
          </Canvas>
        )}
      </div>
    </>
  );
}
