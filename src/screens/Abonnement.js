import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

const modules = [
  { id: 'portail',  icon: '🚗', nom: 'Portail / Garage',    desc: 'Ouvrez votre portail depuis votre telephone',   prix: 'Inclus', dispo: true },
  { id: 'serrure',  icon: '🔐', nom: 'Serrure connectee',   desc: 'Controlez votre serrure de porte',              prix: 'Bientot', dispo: false },
  { id: 'alarme',   icon: '🔔', nom: 'Alarme maison',       desc: 'Armez et desarmez votre alarme a distance',     prix: 'Bientot', dispo: false },
  { id: 'lumiere',  icon: '💡', nom: 'Lumieres connectees', desc: 'Gerez vos lumieres intelligentes',               prix: 'Bientot', dispo: false },
  { id: 'camera',   icon: '📷', nom: 'Camera surveillance', desc: 'Visualisez vos cameras en temps reel',          prix: 'Bientot', dispo: false },
];

export default function Abonnement({ user, onBack }) {
  const [abonne, setAbonne] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('qbdp_token');
    fetch(`${BASE_URL}/stripe/statut`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.abonne) setAbonne(true); })
      .catch(() => {})
      .finally(() => setChecking(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setAbonne(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleAbonnement = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('qbdp_token');
      const res = await fetch(`${BASE_URL}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Erreur');
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: '#6b7280' }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', paddingBottom: 80 }}>
      <div style={{ background: '#1a56db', padding: '20px 20px 40px', color: 'white' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', marginBottom: 12 }}>←</button>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Extension privee</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Etendez QBDP a votre domicile</div>
      </div>

      <div style={{ margin: '-20px 16px 0', background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {!abonne ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Passez a l extension privee</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Gerez vos acces personnels depuis la meme app</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>2€ <span style={{ fontSize: 14, fontWeight: 400 }}>/ mois</span></div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>Sans engagement — resiliable a tout moment</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {['Portail et garage connectes', 'Modules supplementaires a venir', 'Support prioritaire', 'Historique illimite'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button onClick={handleAbonnement} disabled={loading} style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Redirection...' : 'Activer pour 2€/mois'}
            </button>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>Paiement securise par Stripe</div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Extension activee !</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Vos modules prives sont disponibles</div>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 12, marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>Abonnement actif — 2€/mois</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modules disponibles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modules.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: m.dispo ? 1 : 0.6 }}>
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{m.nom}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{m.desc}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: m.dispo ? '#16a34a' : '#9ca3af', background: m.dispo ? '#f0fdf4' : '#f9fafb', padding: '3px 8px', borderRadius: 8 }}>
                {m.prix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
