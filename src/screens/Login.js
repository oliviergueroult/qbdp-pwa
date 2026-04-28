import React, { useState, useEffect } from 'react';
import { login } from '../api';
import logo2 from '../assets/favicon.png';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [logoSociete, setLogoSociete] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/personnalisation/logo-public`)
      .then(r => r.json())
      .then(data => { if (data.logo_base64) setLogoSociete(data.logo_base64); })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f4f5f7' }}>
      <div style={{ width: '100%', background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logoSociete || logo2} style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 16, objectFit: 'contain' }} alt="Logo" />
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Connectez-vous à votre espace</div>
          {logoSociete && (
            <div style={{ fontSize: 10, color: '#d1d5db', marginTop: 8 }}>Powered by qbdp</div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</div>
          <input
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', background: '#f9fafb' }}
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.fr"
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mot de passe</div>
          <input
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', background: '#f9fafb' }}
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 16 }}>
            {error}
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}