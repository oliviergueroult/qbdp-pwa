import React, { useState, useEffect } from 'react';
import { getAccesEmploye } from '../api';
import favicon from '../assets/favicon.png';

const BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const BLE_AUTH_UUID    = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const BLE_STATUS_UUID  = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const BLE_CONFIRM_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';
const API = 'https://qbdp-backend-production.up.railway.app/api';

export default function Acces({ user }) {
  const [employe, setEmploye]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [bleStatut, setBleStatut]     = useState('idle');
  const [bleMessage, setBleMessage]   = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [branding, setBranding]       = useState({
    couleur_principale: '#1a56db',
    couleur_secondaire: '#1e40af',
  });

  const savedUser = (() => {
    const raw = sessionStorage.getItem('qbdp_user');
    return raw && raw !== 'null' ? JSON.parse(raw) : {};
  })();
  const isClient = savedUser.role === 'client' || user?.role === 'client';

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
      .then(data => setEmploye(data.employe))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const connecterBLE = async () => {
    if (!navigator.bluetooth) {
      alert('Bluetooth non supporté. Utilisez Chrome sur Android.');
      return;
    }
    try {
      setBleStatut('scan'); setBleMessage('Recherche du lecteur QBDP...');
      const device   = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'QBDP-' }],
        optionalServices: [BLE_SERVICE_UUID]
      });
      setBleMessage('Connexion...');
      const server   = await device.gatt.connect();
      const service  = await server.getPrimaryService(BLE_SERVICE_UUID);
      const authChar = await service.getCharacteristic(BLE_AUTH_UUID);
      const statChar = await service.getCharacteristic(BLE_STATUS_UUID);
      const confChar = await service.getCharacteristic(BLE_CONFIRM_UUID);
      await statChar.startNotifications();
      statChar.addEventListener('characteristicvaluechanged', (e) => {
        const val = new TextDecoder().decode(e.target.value);
        if (val === 'CONFIRM_REQUIRED') {
          setBleStatut('confirm'); setBleMessage(''); setConfirmation({ confChar });
        } else if (val === 'GRANTED') {
          setBleStatut('success'); setBleMessage('Accès autorisé !');
          setTimeout(() => { setBleStatut('idle'); setBleMessage(''); }, 3000);
        } else if (val === 'DENIED') {
          setBleStatut('denied'); setBleMessage('Accès refusé');
          setTimeout(() => { setBleStatut('idle'); setBleMessage(''); }, 3000);
        } else if (val === 'TIMEOUT' || val === 'CANCELLED') {
          setBleStatut('idle'); setBleMessage('');
        }
      });
      setBleStatut('auth'); setBleMessage('Authentification...');
      const token    = sessionStorage.getItem('qbdp_token');
      const authData = (user?.id || savedUser.id) + ':' + token;
      await authChar.writeValue(new TextEncoder().encode(authData));
      setBleMessage('En attente...');
      device.addEventListener('gattserverdisconnected', () => {
        setBleStatut('idle'); setBleMessage(''); setConfirmation(null);
      });
    } catch (err) {
      setBleStatut('idle'); setBleMessage('');
      if (err.name !== 'NotFoundError') {
        setBleMessage('Erreur: ' + err.message);
        setTimeout(() => setBleMessage(''), 3000);
      }
    }
  };

  const confirmerOuverture = async () => {
    if (!confirmation) return;
    try {
      await confirmation.confChar.writeValue(new TextEncoder().encode('CONFIRM'));
      setBleStatut('waiting'); setConfirmation(null);
    } catch {}
  };

  const annulerOuverture = async () => {
    if (!confirmation) return;
    try {
      await confirmation.confChar.writeValue(new TextEncoder().encode('CANCEL'));
      setBleStatut('idle'); setConfirmation(null);
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
      Chargement...
    </div>
  );

  const currentUser   = employe || savedUser || user || {};
  const initiales     = currentUser.initiales || currentUser.nom?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const nomComplet    = currentUser.nom || '';
  const service       = currentUser.denomination || currentUser.service || '';
  const numeroChambre = currentUser.numero_chambre || savedUser.numero_chambre || '';
  const matricule     = currentUser.matricule || '';
  const gradient      = `linear-gradient(135deg, ${branding.couleur_principale}, ${branding.couleur_secondaire})`;

  const cardLabel = {
    idle:    'OU CLIQUEZ',
    scan:    'Recherche...',
    auth:    'Authentification...',
    waiting: 'Ouverture en cours...',
    confirm: 'Confirmation requise',
    success: '✅ Accès autorisé !',
    denied:  '❌ Accès refusé',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column', paddingBottom: 70 }}>

      {/* HEADER */}
      <div style={{ background: gradient, padding: '52px 24px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32,
          border: '2.5px solid rgba(255,255,255,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {initiales}
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 20, fontWeight: 700, letterSpacing: 0.3 }}>
            {nomComplet.toUpperCase()}
          </div>
          {isClient ? (
            numeroChambre ? (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                Chambre N°{numeroChambre}
              </div>
            ) : null
          ) : (
            <>
              {matricule ? (
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                  ID N° {matricule}
                </div>
              ) : null}
              {service ? (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                  {service}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* CARTE PRINCIPALE */}
      <div style={{ flex: 1, margin: 16, borderRadius: 20, background: gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '32px 24px 28px', cursor: bleStatut === 'idle' ? 'pointer' : 'default', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        onClick={bleStatut === 'idle' ? connecterBLE : undefined}>

        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 500, letterSpacing: 0.5 }}>
          Approchez du lecteur
        </div>

        <img src={favicon} alt="QBDP"
          style={{ width: 180, height: 180, objectFit: 'contain', opacity: bleStatut === 'idle' ? 1 : 0.6, filter: 'brightness(0) invert(1)', transition: 'opacity 0.3s' }} />

        <div style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: 2, opacity: bleStatut === 'idle' ? 1 : 0.8 }}>
          {cardLabel[bleStatut] || 'OU CLIQUEZ'}
        </div>
      </div>

      {/* MESSAGE BLE */}
      {bleMessage && bleStatut !== 'idle' && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginBottom: 8 }}>
          {bleMessage}
        </div>
      )}

      {/* MODAL CONFIRMATION */}
      {bleStatut === 'confirm' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Confirmer l'ouverture</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Voulez-vous ouvrir cet accès ?</div>
            <button onClick={confirmerOuverture} style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
              ✅ Ouvrir
            </button>
            <button onClick={annulerOuverture} style={{ width: '100%', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
