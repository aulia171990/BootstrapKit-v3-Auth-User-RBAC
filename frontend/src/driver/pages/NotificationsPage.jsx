import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Text, Flex, Loading, ErrorState, EmptyState, Badge, Skeleton } from '../../design-system/index.js';
import { ChevronLeft, Bell, RefreshCw, CheckCheck } from 'lucide-react';
import { driverAPI } from '../driver-api.js';

export default function NotificationsPage({ onBack }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await driverAPI.notifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    await driverAPI.notificationMarkAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkRead = async (id) => {
    await driverAPI.notificationMarkRead([id]);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
  };

  if (error && notifs.length === 0) {
    return (
      <div className="drv-page">
        <header className="drv-page-header">
          <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Notifikasi</h2>
        </header>
        <ErrorState title="Gagal memuat" description="Tidak dapat memuat notifikasi." onRetry={load} />
      </div>
    );
  }

  const toneFor = (cat) =>
    cat === 'trip' ? 'info' : cat === 'payment' || cat === 'wallet' ? 'success' : cat === 'promotion' ? 'warning' : 'neutral';

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Notifikasi</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="drv-page-action" onClick={handleMarkAllRead} title="Tandai semua sudah dibaca">
            <CheckCheck size={16} />
          </button>
          <button className="drv-page-action" onClick={load}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <div className="drv-page-body">
        {loading ? (
          <Skeleton variant="list" lines={6} />
        ) : notifs.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState icon={Bell} title="Tidak ada notifikasi" description="Notifikasi akan muncul di sini." />
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`drv-notif-row ${n.unread ? 'drv-notif-row--unread' : ''}`}
              onClick={() => n.unread && handleMarkRead(n.id)}
            >
              <Flex gap={8} style={{ alignItems: 'flex-start' }}>
                <Badge variant={toneFor(n.category)} size="sm" style={{ marginTop: 2 }}>
                  {n.category || 'info'}
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" weight={n.unread ? 'bold' : undefined}>{n.title}</Text>
                  {n.body && <Text size="xs" color="muted" style={{ marginTop: 2 }}>{n.body}</Text>}
                  {n.timestamp && (
                    <Text size="xs" color="muted" style={{ marginTop: 2 }}>
                      {new Date(n.timestamp).toLocaleString('id-ID')}
                    </Text>
                  )}
                </div>
                {n.unread && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--ds-color-primary)', flexShrink: 0, marginTop: 6,
                  }} />
                )}
              </Flex>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
