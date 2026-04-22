import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

export default function CreerMotDePasse({ onSuccess }) {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async () => {
    setError('');
    if (!token) return setError('Lien invalide');
    if (password.length < 6) return setError('Minimum 6 caractères');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/invitations/activer`, { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f4f5f7' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Compte activé !</div>
        <p style={{ color: '#6b7280', marginTop: 8, marginBottom: 24 }}>Vous pouvez maintenant vous connecter à l'app QBDP.</p>
        <button onClick={() => window.location.href = 'https://qbdp-mobile.vercel.app'} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f4f5f7' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 12 }} alt="QBDP" />
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Créer mon mot de passe</div>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>Choisissez un mot de passe pour accéder à QBDP</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mot de passe</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirmer</div>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }} />
        </div>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 16 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Activation...' : 'Activer mon compte'}
        </button>
      </div>
    </div>
  );
}
