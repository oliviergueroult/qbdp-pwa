import React, { useState, useEffect } from 'react';
import { getLogs } from '../api';

const dotColor = { success: '#16a34a', warning: '#d97706', error: '#dc2626' };
const pillStyle = {
  success: { bg: '#dcfce7', color: '#166534', label: 'OK' },
  warning: { bg: '#fef3c7', color: '#92400e', label: 'Bloqué' },
  error:   { bg: '#fee2e2', color: '#991b1b', label: 'Refusé' },
};

export default function Historique() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs().then(data => {
      setLogs(Array.isArray(data) ? data : data.logs || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1a56db', padding: '48px 20px 20px' }}>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Historique</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{logs.length} événements</div>
      </div>

      <div style={{ padding: 16 }}>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 }}>{date}</div>
            {items.map((log, i) => {
              const p = pillStyle[log.type] || pillStyle.success;
              return (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: dotColor[log.type] || '#9ca3af', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{log.employe || 'Inconnu'} — {log.batiment || ''}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      {log.action} · {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ background: p.bg, color: p.color, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10 }}>{p.label}</span>
                </div>
              );
            })}
          </div>
        ))}
        {logs.length === 0 && <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>Aucun événement</div>}
      </div>
    </div>
  );
}
