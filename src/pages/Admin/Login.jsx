import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    
    // Hardcoded simple login
    if (email === 'admin@laced.com' && password === '123456') {
      localStorage.setItem('laced_admin', 'true');
      navigate('/admin');
    } else {
      setError('الإيميل أو كلمة السر غير صحيحة');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'black', color: 'white' }}>
      <form onSubmit={handleLogin} style={{ background: '#111', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="brand-font" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>LACED ADMIN</h1>
        
        {error && <div style={{ background: '#3b0000', color: '#ff6b6b', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>{error}</div>}
        
        <input 
          type="email" 
          placeholder="الإيميل" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '1rem', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }}
        />
        
        <input 
          type="password" 
          placeholder="كلمة السر" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '1rem', background: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px' }}
        />
        
        <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
