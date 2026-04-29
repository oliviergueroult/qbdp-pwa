import React, { useState, useEffect } from 'react';
import { getAccesEmploye } from '../api';

const API = 'https://qbdp-backend-production.up.railway.app/api';

const typeIcon = {
  batiment:'🏢', parking:'🅿️', garage:'🚗', entree:'🚪', bureau:'🪑',
  reunion:'🤝', serveur:'🖥️', infirmerie:'🏥', cafeteria:'☕', entrepot:'📦',
  securite:'🔑', ascenseur:'🛗', direction:'👔', administration:'📋',
  comptabilite:'💰', toilettes:'🚻', reprographie:'🖨️', repos:'🛋️',
  coworking:'💻', maintenance:'🔧', archives:'📚', formation:'🎓',
  sport:'🏋️', laboratoire:'🔬', pharmacie:'💊', labo:'🧪', accueil:'📱', porte:'🔒',
};

export default function MesAcces({ user }) {
  const [acces, setAcces]     = useState([]);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState({ couleur_principale: '#1a56db', couleur_secondaire: '#1e40af' });

  const savedUser = (() => {
    const raw = sessionStorage.getItem('qbdp_user');
    return raw && raw !== 'null' ? JSON.parse(raw) : {};
  })();

  useEffect(() => {
    const emailParam = savedUser.email ? `?email=${encodeURIComponent(savedUser.email)}` : '';
    fetch(`${API}/personnalisation/logo-public${emailParam}`)
      .then(r => r.json())
      .then(d => setBranding({
        couleur_principale: d.couleur_principale || '#1a56db',
        couleur_secondaire: d.couleur_secondaire || '#1e40af',
      }))
      .catch(() => {});

    const id = savedUser.id || user?.id;
    if (!id) { setLoading(false); return; }
    getAccesEmploye(id)
      .then(data => { setEmploye(data.employe); setAcces(data.acces || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const gradient = `linear-gradient(135deg, ${branding.couleur_principale}, ${branding.couleur_secondaire})`;
  const currentUser = employe || savedUser || user || {};
  const nomComplet  = currentUser.nom || '';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: gradient, padding: '52px 24px 24px' }}>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Mes accès</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 }}>
          {acces.length} droit{acces.length !== 1 ? 's' : ''} autorisé{acces.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {acces.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb', marginTop: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Aucun accès assigné</div>
            <div style={{ fontSize: 13 }}>Contactez votre administrateur</div>
          </div>
        ) : (
          acces.map((a, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 10, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: branding.couleur_principale + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {typeIcon[a.porte_type] || '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{a.porte_nom}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{a.batiment_nom}</div>
              </div>
              <span style={{ background: '#dcfce7', color: '#166634', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>✓ Autorisé</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
