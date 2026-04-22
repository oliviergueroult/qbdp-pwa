import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';
const HUE_TOKEN = '6CDRbf1EgHDuUsvkNdwBlbL2YZvFdek9PQDeSrdC';
const HUE_BASE = `https://jelsoft-leon-necessity-palm.trycloudflare.com/api/${HUE_TOKEN}`;
const HUE_HEADERS = { 'ngrok-skip-browser-warning': '1', 'Content-Type': 'application/json' };

const modules = [
  { id: 'lumiere', icon: '💡', nom: 'Lumières connectées', desc: 'Gérez vos lumières Philips Hue',              prix: 'Inclus',  dispo: true  },
  { id: 'portail', icon: '🚗', nom: 'Portail / Garage',    desc: 'Ouvrez votre portail depuis votre téléphone', prix: 'Bientôt', dispo: false },
  { id: 'volets',  icon: '🪟', nom: 'Volets Somfy',        desc: 'Contrôlez vos volets à distance',             prix: 'Bientôt', dispo: false },
  { id: 'alarme',  icon: '🔔', nom: 'Alarme maison',       desc: 'Armez et désarmez votre alarme',              prix: 'Bientôt', dispo: false },
  { id: 'camera',  icon: '📷', nom: 'Caméra surveillance', desc: 'Visualisez vos caméras en temps réel',        prix: 'Bientôt', dispo: false },
];

export default function MaMaison({ user }) {
  const [abonne, setAbonne] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [lights, setLights] = useState([]);
  const [hueError, setHueError] = useState('');

  useEffect(() => {
    // Vérifier d'abord sessionStorage
    if (sessionStorage.getItem('qbdp_abonne') === 'true') {
      setAbonne(true);
      fetchLights();
      setChecking(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setAbonne(true);
      sessionStorage.setItem('qbdp_abonne', 'true');
      fetchLights();
      setChecking(false);
      window.history.replaceState({}, '', '/');
      return;
    }

    const token = sessionStorage.getItem('qbdp_token');
    fetch(`${BASE_URL}/stripe/statut`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.abonne) {
          setAbonne(true);
          sessionStorage.setItem('qbdp_abonne', 'true');
          fetchLights();
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const fetchLights = async () => {
    try {
      const res = await fetch(`${HUE_BASE}/lights`, { headers: HUE_HEADERS });
      const data = await res.json();
      const list = Object.entries(data).map(([id, l]) => ({
        id, name: l.name, on: l.state.on,
        bri: l.state.bri, reachable: l.state.reachable,
      }));
      setLights(list);
      setHueError('');
    } catch {
      setHueError('Lumières disponibles uniquement sur votre réseau WiFi domicile');
    }
  };

  const toggleLight = async (id, currentOn) => {
    try {
      await fetch(`${HUE_BASE}/lights/${id}/state`, {
        method: 'PUT',
        headers: HUE_HEADERS,
        body: JSON.stringify({ on: !currentOn }),
      });
      setLights(prev => prev.map(l => l.id === id ? { ...l, on: !currentOn } : l));
    } catch {}
  };

  const setBrightness = async (id, bri) => {
    try {
      await fetch(`${HUE_BASE}/lights/${id}/state`, {
        method: 'PUT',
        headers: HUE_HEADERS,
        body: JSON.stringify({ bri: parseInt(bri) }),
      });
      setLights(prev => prev.map(l => l.id === id ? { ...l, bri: parseInt(bri) } : l));
    } catch {}
  };

  const handleAbonnement = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('qbdp_token');
      const res = await fetch(`${BASE_URL}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Erreur');
    } catch {
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
      <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '48px 20px 40px', color: 'white' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🏠 Ma Maison</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Étendez QBDP à votre domicile</div>
      </div>

      <div style={{ margin: '-20px 16px 0', background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {!abonne ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Passez à l'extension privée</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Gérez vos accès personnels depuis la même app</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>2€ <span style={{ fontSize: 14, fontWeight: 400 }}>/ mois</span></div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>Sans engagement — résiliable à tout moment</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {['Lumières connectées Hue', 'Portail et garage (bientôt)', 'Volets Somfy (bientôt)', 'Support prioritaire'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button onClick={handleAbonnement} disabled={loading} style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Redirection...' : 'Activer à partir de 2€/mois'}
            </button>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>Paiement sécurisé par Stripe</div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>✅ Extension activée</div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 10, marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>Abonnement actif — 2€/mois</div>
              </div>
            </div>

            {hueError ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, color: '#991b1b', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                📡 {hueError}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  Lumières ({lights.length})
                </div>
                {lights.map(light => (
                  <div key={light.id} style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: light.on ? 10 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{light.on ? '💡' : '🔦'}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{light.name}</div>
                          <div style={{ fontSize: 12, color: light.on ? '#16a34a' : '#6b7280' }}>{light.on ? 'Allumée' : 'Éteinte'}</div>
                        </div>
                      </div>
                      <button onClick={() => toggleLight(light.id, light.on)} style={{
                        width: 50, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                        background: light.on ? '#1a56db' : '#e5e7eb', position: 'relative', transition: 'background 0.3s',
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 10, background: 'white',
                          position: 'absolute', top: 3, left: light.on ? 27 : 3,
                          transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </div>
                    {light.on && (
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                          Luminosité : {Math.round(light.bri / 254 * 100)}%
                        </div>
                        <input type="range" min="1" max="254" value={light.bri}
                          onChange={e => setBrightness(light.id, e.target.value)}
                          style={{ width: '100%', accentColor: '#1a56db' }} />
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={fetchLights} style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, color: '#374151', cursor: 'pointer', marginBottom: 16 }}>
                  🔄 Actualiser
                </button>
              </>
            )}
          </>
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