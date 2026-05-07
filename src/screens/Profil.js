import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

export default function Profil({ user, onLogout }) {
  const [employe, setEmploye] = useState(null);
  const [nomEtab, setNomEtab] = useState('');
  const [couleur, setCouleur] = useState('#1a56db');

  useEffect(() => {
    const token = sessionStorage.getItem('qbdp_token');
    fetch(`${BASE_URL}/employes/moi/acces-mobile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.employe) setEmploye(data.employe); })
      .catch(() => {});

    const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
    fetch(`${BASE_URL}/personnalisation/logo-public${emailParam}`)
      .then(r => r.json())
      .then(d => {
        setNomEtab(d.nom_etablissement || d.societe || 'QBDP');
        if (d.couleur_principale) setCouleur(d.couleur_principale);
      })
      .catch(() => {});
  }, []);

  const denomination = employe?.denomination || employe?.service || user?.role || 'employé';

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vous déconnecter ?')) {
      sessionStorage.removeItem('qbdp_token');
      sessionStorage.removeItem('qbdp_user');
      onLogout();
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: couleur, margin: '52px 16px 0', borderRadius: 20, padding: '28px 20px 28px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <img src="/logo3.png" alt="qbdp" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
        <div style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{employe?.nom || user?.nom || 'Employé'}</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{user?.email || ''}</div>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 10, marginTop: 8 }}>
          {denomination}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: couleur, textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>{nomEtab || 'Établissement'}</div>
          {[
            { label: 'Email',     value: user?.email || '—' },
            { label: 'Service',   value: denomination },
            { label: 'Matricule', value: employe?.matricule || '—' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>Application</div>
          {[
            { label: 'Version', value: '1.1.0' },
            { label: 'Serveur', value: 'qbdp-backend-production.up.railway.app' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#1a1a2e', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} style={{ width: '100%', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}