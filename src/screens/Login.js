import React, { useState, useEffect } from 'react';
import { login } from '../api';
import logo2 from '../assets/favicon.png';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

export default function Login({ onLogin }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleForgot = async () => {
    setError(''); setSuccess('');
    if (!email) { setError('Entrez votre adresse email'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect_url: 'https://qbdp-mobile.vercel.app' })
      });
      if (res.ok) {
        setSuccess('Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur');
      }
    } catch { setError('Erreur de connexion'); }
    setLoading(false);
  };

  const inp = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '12px 14px', fontSize: 15, outline: 'none', background: '#f9fafb', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f5ff 0%, #f9fafb 100%)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'white', borderRadius: 24, padding: '40px 40px', boxShadow: '0 24px 64px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src={logoSociete || logo2} style={{ width: 140, height: 140, borderRadius: 24, marginBottom: 12, objectFit: 'contain' }} alt="Logo" />
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>
            {mode === 'login' ? 'Connexion' : 'Mot de passe oublié'}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Entrez votre email pour recevoir un lien'}
          </div>
          {logoSociete && (
            <div style={{ fontSize: 10, color: '#d1d5db', marginTop: 6 }}>Powered by qbdp</div>
          )}
        </div>

        {/* FORMULAIRE LOGIN */}
        {mode === 'login' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</div>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mot de passe</div>
              <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: 44 }} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 18, color: '#9ca3af', userSelect: 'none' }}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <span onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                style={{ fontSize: 12, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}>
                Mot de passe oublié ?
              </span>
            </div>
          </>
        )}

        {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
        {mode === 'forgot' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</div>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.fr" onKeyDown={e => e.key === 'Enter' && handleForgot()} />
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#15803d', marginBottom: 16 }}>
            {success}
          </div>
        )}

        {!success && (
          <button onClick={mode === 'login' ? handleSubmit : handleForgot} disabled={loading}
            style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Chargement...' : mode === 'login' ? 'Se connecter →' : 'Envoyer le lien →'}
          </button>
        )}

        {mode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{ color: '#1a56db', fontWeight: 600, cursor: 'pointer' }}>
              ← Retour à la connexion
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
