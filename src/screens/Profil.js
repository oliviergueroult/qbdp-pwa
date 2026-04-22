import React, { useState } from 'react';
import Abonnement from './Abonnement';

export default function Profil({ user, onLogout }) {
  const [showAbonnement, setShowAbonnement] = useState(false);
  const initiales = user?.nom ? user.nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'AD';

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vous déconnecter ?')) {
      sessionStorage.removeItem('qbdp_token');
      sessionStorage.removeItem('qbdp_user');
      onLogout();
    }
  };

  if (showAbonnement) return <Abonnement user={user} onBack={() => setShowAbonnement(false)} />;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1a56db', padding: '48px 20px 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'white', margin: '0 auto 12px' }}>
          {initiales}
        </div>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{user?.nom || 'Employé'}</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{user?.email || ''}</div>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 10, marginTop: 8 }}>
          {user?.role || 'employé'}
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>Informations</div>
          {[
            { label: 'Société', value: user?.societe || 'QBDP Demo' },
            { label: 'Email',   value: user?.email   || '—' },
            { label: 'Rôle',    value: user?.role    || 'employé' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setShowAbonnement(true)} style={{ width: '100%', background: 'white', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🏠</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Extension privée</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Gérez vos accès à domicile — 2€/mois</div>
            </div>
          </div>
          <span style={{ color: '#1a56db', fontSize: 18 }}>›</span>
        </button>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>Application</div>
          {[
            { label: 'Version', value: '1.0.0' },
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
