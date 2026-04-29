import React, { useState, useEffect } from 'react';
import Login from './screens/Login';
import Acces from './screens/Acces';
import Historique from './screens/Historique';
import Profil from './screens/Profil';
import MaMaison from './screens/MaMaison';
import CreerMotDePasse from './screens/CreerMotDePasse';
import ResetMotDePasse from './screens/ResetMotDePasse';

const tabs = [
  { id: 'acces',      label: 'Ouvrir',   icon: '🔑' },
  { id: 'historique', label: 'Accès',    icon: '🚪' },
  { id: 'maison',     label: 'Maison',   icon: '🏠' },
  { id: 'profil',     label: 'Profil',   icon: '👤' },
];

function InstallBanner({ onClose }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 400, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '18px 20px', zIndex: 999, border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <img src="/logo.png" style={{ width: 44, height: 44, borderRadius: 10 }} alt="QBDP" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>Installer QBDP</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Accès rapide depuis votre écran d'accueil</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, color: '#9ca3af', cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      <div style={{ background: '#f0f5ff', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#374151' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a56db' }}>Sur iPhone / iPad :</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ background: '#1a56db', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>1</span>
          Appuyez sur <strong>⬆️ Partager</strong> en bas de Safari
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: '#1a56db', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>2</span>
          Choisissez <strong>"Sur l'écran d'accueil"</strong>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('acces');
  const [ready, setReady] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const token = new URLSearchParams(window.location.search).get('token');

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const savedToken = sessionStorage.getItem('qbdp_token');
    const savedUser = sessionStorage.getItem('qbdp_user');
    if (savedToken && savedUser) setUser(JSON.parse(savedUser));
    setReady(true);

    const dismissed = localStorage.getItem('qbdp_install_dismissed');
    if (!isInstalled && !dismissed && isIOS) {
      setTimeout(() => setShowInstall(true), 2000);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const d = localStorage.getItem('qbdp_install_dismissed');
      if (!isInstalled && !d) setShowInstall(true);
    });
  }, []);

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('qbdp_install_dismissed', '1');
  };

  const handleLogin = (u) => {
    setUser(u);
    const dismissed = localStorage.getItem('qbdp_install_dismissed');
    if (!isInstalled && !dismissed) {
      setTimeout(() => setShowInstall(true), 1500);
    }
  };

  if (!ready) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>Chargement...</div></div>;
  const resetToken = new URLSearchParams(window.location.search).get('reset');
  if (resetToken) return <ResetMotDePasse />;
  if (token) return <CreerMotDePasse onSuccess={() => window.location.href = '/'} />;
  if (!user) return <Login onLogin={handleLogin} />;

  const pages = {
    acces: <Acces user={user} />,
    historique: <Historique user={user} />,
    profil: <Profil user={user} onLogout={() => setUser(null)} />,
    maison: <MaMaison />,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      {showInstall && (
        isAndroid && deferredPrompt ? (
          <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 400, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '18px 20px', zIndex: 999, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <img src="/logo.png" style={{ width: 44, height: 44, borderRadius: 10 }} alt="QBDP" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>Installer QBDP</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Accès rapide depuis votre écran d'accueil</div>
              </div>
              <button onClick={handleDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>
            <button onClick={handleInstallAndroid} style={{ width: '100%', background: '#1a56db', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Installer l'application
            </button>
          </div>
        ) : <InstallBanner onClose={handleDismiss} />
      )}
      <div style={{ paddingBottom: 70 }}>{pages[tab]}</div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', height: 70 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', color: tab === t.id ? '#1a56db' : '#9ca3af', borderTop: tab === t.id ? '2px solid #1a56db' : '2px solid transparent', paddingBottom: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
