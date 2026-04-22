import React, { useState, useEffect } from 'react';
import { getEmployes } from '../api';

export default function Acces({ user }) {
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployes().then(employes => {
      setEmploye(employes[0]);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1a56db', padding: '48px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {employe?.initiales || 'JD'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Bonjour {employe?.nom?.split(' ')[0]} 👋</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{employe?.service} · <span style={{ color: '#4ade80' }}>{employe?.statut}</span></div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Mes accès autorisés</div>
        {(employe?.acces || []).map((a, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.porte_nom}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.batiment}</div>
            </div>
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10 }}>Autorisé</span>
          </div>
        ))}
        {(!employe?.acces || employe.acces.length === 0) && (
          <div style={{ background: 'white', borde
cat > src/screens/Acces.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { getEmployes } from '../api';

export default function Acces({ user }) {
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployes().then(employes => {
      setEmploye(employes[0]);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1a56db', padding: '48px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {employe?.initiales || 'JD'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Bonjour {employe?.nom?.split(' ')[0]} 👋</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{employe?.service} · <span style={{ color: '#4ade80' }}>{employe?.statut}</span></div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Mes accès autorisés</div>
        {(employe?.acces || []).map((a, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.porte_nom}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.batiment}</div>
            </div>
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10 }}>Autorisé</span>
          </div>
        ))}
        {(!employe?.acces || employe.acces.length === 0) && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            Aucun accès configuré
          </div>
        )}

        <button
          onClick={() => alert('Approchez votre téléphone du lecteur pour ouvrir la porte')}
          style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 600, marginTop: 8 }}>
          📱  Ouvrir via téléphone
        </button>
      </div>
    </div>
  );
}
