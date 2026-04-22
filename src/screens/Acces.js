import React, { useState, useEffect } from 'react';
import { getAccesEmploye } from '../api';

const BLE_SERVICE_UUID  = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const BLE_AUTH_UUID     = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const BLE_STATUS_UUID   = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const BLE_CONFIRM_UUID  = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';

const typeIcon = {
  batiment:'🏢', parking:'🅿️', garage:'🚗', entree:'🚪', bureau:'🪑',
  reunion:'🤝', serveur:'🖥️', infirmerie:'🏥', cafeteria:'☕', entrepot:'📦',
  securite:'🔑', ascenseur:'🛗', direction:'👔', administration:'📋',
  comptabilite:'💰', toilettes:'🚻', reprographie:'🖨️', repos:'🛋️',
  coworking:'💻', maintenance:'🔧', archives:'📚', formation:'🎓',
  sport:'🏋️', laboratoire:'🔬', pharmacie:'💊', labo:'🧪', accueil:'📱', porte:'🔒',
};

export default function Acces({ user }) {
  const [employe, setEmploye]     = useState(null);
  const [acces, setAcces]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bleStatut, setBleStatut] = useState('idle');
  const [bleMessage, setBleMessage] = useState('');
  const [bleDevice, setBleDevice] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [statusChar, setStatusChar] = useState(null);
  const [confirmChar, setConfirmChar] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('qbdp_user');
const savedUser = raw && raw !== 'null' ? JSON.parse(raw) : {};
    const id = savedUser.id || user?.id;
    if (!id) { setLoading(false); return; }
    getAccesEmploye(id)
      .then(data => {
        setEmploye(data.employe);
        setAcces(data.acces || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const connecterBLE = async () => {
    if (!navigator.bluetooth) {
      alert('Bluetooth non supporté sur ce navigateur. Utilisez Chrome sur Android.');
      return;
    }
    try {
      setBleStatut('scan');
      setBleMessage('Recherche du lecteur QBDP...');

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'QBDP-' }],
        optionalServices: [BLE_SERVICE_UUID]
      });

      setBleMessage('Connexion au lecteur...');
      const server  = await device.gatt.connect();
      const service = await server.getPrimaryService(BLE_SERVICE_UUID);

      const authChar    = await service.getCharacteristic(BLE_AUTH_UUID);
      const statChar    = await service.getCharacteristic(BLE_STATUS_UUID);
      const confChar    = await service.getCharacteristic(BLE_CONFIRM_UUID);

      setStatusChar(statChar);
      setConfirmChar(confChar);
      setBleDevice(device);

      // Ecouter les notifications du lecteur
      await statChar.startNotifications();
      statChar.addEventListener('characteristicvaluechanged', (e) => {
        const val = new TextDecoder().decode(e.target.value);
        console.log('[BLE] Statut reçu:', val);
        if (val === 'CONFIRM_REQUIRED') {
          setBleStatut('confirm');
          setBleMessage("Confirmez l'ouverture");
          setConfirmation({ statChar: statChar, confChar: confChar });
        } else if (val === 'GRANTED') {
          setBleStatut('success');
          setBleMessage('Accès autorisé ! ✅');
          setTimeout(() => { setBleStatut('idle'); setBleMessage(''); }, 3000);
        } else if (val === 'DENIED') {
          setBleStatut('denied');
          setBleMessage('Accès refusé ❌');
          setTimeout(() => { setBleStatut('idle'); setBleMessage(''); }, 3000);
        } else if (val === 'TIMEOUT') {
          setBleStatut('idle');
          setBleMessage('Délai dépassé');
          setTimeout(() => setBleMessage(''), 2000);
        } else if (val === 'CANCELLED') {
          setBleStatut('idle');
          setBleMessage('Annulé');
          setTimeout(() => setBleMessage(''), 2000);
        }
      });

      // Envoyer authentification
      setBleStatut('auth');
      setBleMessage('Authentification...');
      const token = sessionStorage.getItem('qbdp_token');
      const authData = (user?.id || JSON.parse(sessionStorage.getItem('qbdp_user') || '{}' ).id) + ':' + token;
      const encoder = new TextEncoder();
      await authChar.writeValue(encoder.encode(authData));
      setBleMessage('En attente de confirmation...');

      device.addEventListener('gattserverdisconnected', () => {
        setBleDevice(null);
        setBleStatut('idle');
        setConfirmation(null);
      });

    } catch (err) {
      console.error('[BLE]', err);
      setBleStatut('idle');
      if (err.name !== 'NotFoundError') {
        setBleMessage('Erreur: ' + err.message);
        setTimeout(() => setBleMessage(''), 3000);
      }
    }
  };

  const confirmerOuverture = async () => {
    if (!confirmation) return;
    try {
      const encoder = new TextEncoder();
      await confirmation.confChar.writeValue(encoder.encode('CONFIRM'));
      setBleStatut('waiting');
      setBleMessage('Ouverture en cours...');
      setConfirmation(null);
    } catch (err) {
      console.error('[BLE Confirm]', err);
    }
  };

  const annulerOuverture = async () => {
    if (!confirmation) return;
    try {
      const encoder = new TextEncoder();
      await confirmation.confChar.writeValue(encoder.encode('CANCEL'));
      setBleStatut('idle');
      setBleMessage('');
      setConfirmation(null);
    } catch (err) {
      console.error('[BLE Cancel]', err);
    }
  };

  const bleButtonColor = {
    idle:    '#1a56db',
    scan:    '#6b7280',
    auth:    '#6b7280',
    waiting: '#6b7280',
    confirm: '#f59e0b',
    success: '#16a34a',
    denied:  '#dc2626',
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a56db, #1e40af)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {employe?.initiales || user?.initiales || '?'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
              Bonjour {employe?.nom?.split(' ').pop() || user?.nom}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>
              {employe?.denomination || employe?.service || ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Bouton BLE */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Approchez-vous d'un lecteur QBDP
          </div>
          <button
            onClick={connecterBLE}
            disabled={bleStatut !== 'idle'}
            style={{
              width: '100%', background: bleButtonColor[bleStatut] || '#1a56db',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '16px', fontSize: 15, fontWeight: 600, cursor: bleStatut === 'idle' ? 'pointer' : 'default',
              transition: 'background 0.3s',
            }}>
            {bleStatut === 'idle'    && '🔵 Ouvrir via Bluetooth'}
            {bleStatut === 'scan'    && '🔍 Recherche...'}
            {bleStatut === 'auth'    && '🔐 Authentification...'}
            {bleStatut === 'waiting' && '⏳ Ouverture en cours...'}
            {bleStatut === 'confirm' && '⚠️ Confirmation requise'}
            {bleStatut === 'success' && '✅ Accès autorisé !'}
            {bleStatut === 'denied'  && '❌ Accès refusé'}
          </button>
          {bleMessage !== '' && bleStatut !== 'idle' && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>{bleMessage}</div>
          )}
        </div>

        {/* Modal confirmation */}
        {bleStatut === 'confirm' && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔓</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Confirmer l'ouverture</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
                Voulez-vous ouvrir cet accès ?
              </div>
              <button onClick={confirmerOuverture} style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
                ✅ Ouvrir
              </button>
              <button onClick={annulerOuverture} style={{ width: '100%', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des accès */}
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Mes accès autorisés ({acces.length})
        </div>

        {acces.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
            Aucun accès assigné pour le moment
          </div>
        ) : (
          acces.map((a, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {typeIcon[a.porte_type] || '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.porte_nom}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.batiment_nom}</div>
              </div>
              <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10 }}>✓</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
