import React, { useEffect, useState } from 'react';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Asics Gel-Kayano 14', price: '$160.00', type: 'runner', imageUrl: '/asics-kayano.jpg' },
  { id: 2, name: 'Adidas Campus 00s Grey', price: '$110.00', type: 'classic', imageUrl: '/adidas-campus.jpg' }
];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'phantom' });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    loadProducts();
  }, []);

  function checkUser() {
    if (localStorage.getItem('laced_admin') !== 'true') {
      navigate('/admin/login');
    }
  }

  function loadProducts() {
    const saved = localStorage.getItem('laced_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('laced_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  }

  function handleLogout() {
    localStorage.removeItem('laced_admin');
    navigate('/admin/login');
  }

  function addProduct(e) {
    e.preventDefault();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const addedProduct = { id: newId, name: newProduct.name, price: newProduct.price, type: newProduct.type };
    
    const updatedProducts = [...products, addedProduct];
    setProducts(updatedProducts);
    localStorage.setItem('laced_products', JSON.stringify(updatedProducts));
    setNewProduct({ name: '', price: '', type: 'phantom' });
  }

  function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('laced_products', JSON.stringify(updatedProducts));
  }

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2rem' }}>لوحة التحكم</h1>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <LogOut size={16} /> خروج
        </button>
      </header>

      <section style={{ marginBottom: '3rem', background: '#111', padding: '2rem', borderRadius: '12px' }}>
        <h2>إضافة منتج جديد</h2>
        <form onSubmit={addProduct} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="اسم الكوتشي (مثال: AIR PHANTOM)" 
            value={newProduct.name} 
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            required
            style={{ padding: '0.8rem', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="السعر (مثال: $245)" 
            value={newProduct.price} 
            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
            required
            style={{ padding: '0.8rem', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', flex: 1 }}
          />
          <select 
            value={newProduct.type} 
            onChange={e => setNewProduct({...newProduct, type: e.target.value})}
            style={{ padding: '0.8rem', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }}
          >
            <option value="phantom">Phantom (شكل 1)</option>
            <option value="classic">Classic (شكل 2)</option>
            <option value="runner">Runner (شكل 3)</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> إضافة
          </button>
        </form>
      </section>

      <section>
        <h2>المنتجات الحالية</h2>
        <div style={{ marginTop: '1rem' }}>
          {products.map(product => (
            <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '1rem 1.5rem', marginBottom: '0.5rem', borderRadius: '8px' }}>
              <div>
                <h3 className="brand-font">{product.name}</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{product.price} - الشكل: {product.type}</p>
              </div>
              <button onClick={() => deleteProduct(product.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {products.length === 0 && <p style={{ opacity: 0.5 }}>لا توجد منتجات.</p>}
        </div>
      </section>
    </div>
  );
}
