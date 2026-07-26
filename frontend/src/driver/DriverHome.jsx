import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Avatar, Text, Heading, Button, Flex, Loading, ErrorState, Skeleton,
} from '../design-system/index.js';
import { Bell, DollarSign, ChevronRight, MapPin } from 'lucide-react';
import { driverAPI } from './driver-api.js';
import DriverHeader from './components/DriverHeader.jsx';
import OnlineToggle from './components/OnlineToggle.jsx';

export default function DriverHome({ user: propUser, onNavigate }) {
  const [profile, setProfile] = useState(propUser || null);
  const [driverStats, setDriverStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [today, setToday] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [prof, stats, bal, td, notif] = await Promise.all([
        driverAPI.profile().catch(() => propUser),
        driverAPI.driverStatus(),
        driverAPI.walletBalance(),
        driverAPI.todayEarnings(),
        driverAPI.notificationUnread(),
      ]);
      setProfile(prof);
      setDriverStats(stats);
      setBalance(bal?.balance ?? bal?.available_balance ?? bal);
      setToday(td);
      setUnread(notif?.count ?? notif?.total ?? 0);
      setOnline(stats?.isOnline ?? true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleOnline = async () => {
    const next = !online;
    setOnline(next);
    try {
      await driverAPI.updateOnlineStatus(next ? 'online' : 'offline');
    } catch { setOnline(!next); }
  };

  if (loading && !profile) return (
    <div style={{ padding: 16 }}>
      <Skeleton variant="card" lines={4} />
      <div style={{ marginTop: 12 }}><Skeleton variant="card" lines={3} /></div>
      <div style={{ marginTop: 12 }}><Skeleton variant="list" lines={4} /></div>
    </div>
  );
  if (error && !profile) return <ErrorState title="Gagal memuat" description="Tidak dapat memuat dashboard." onRetry={load} />;

  return (
    <div className="drv-home">
      <DriverHeader driver={profile} unread={unread} onNotify={() => onNavigate('notifications')} onProfile={() => onNavigate('tab', { id: 'profile' })} />

      <div style={{ padding: '12px 16px' }}>
        <OnlineToggle
          online={online}
          onToggle={handleToggleOnline}
          zone={driverStats?.zone}
          todayTrips={driverStats?.todayTrips || today?.trips || 0}
        />

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Card style={{ textAlign: 'center' }} onClick={() => onNavigate('tab', { id: 'earnings' })}>
            <DollarSign size={20} color="var(--ds-color-success)" style={{ margin: '0 auto 4px' }} />
            <Text size="xs" color="muted">Pendapatan</Text>
            <Heading size="xs" style={{ marginTop: 2 }}>
              {today ? `Rp ${(today.total || 0).toLocaleString('id-ID')}` : '—'}
            </Heading>
          </Card>
          <Card style={{ textAlign: 'center' }} onClick={() => onNavigate('tab', { id: 'trips' })}>
            <MapPin size={20} color="var(--ds-color-primary)" style={{ margin: '0 auto 4px' }} />
            <Text size="xs" color="muted">Trip Hari Ini</Text>
            <Heading size="xs" style={{ marginTop: 2 }}>{today?.trips || driverStats?.todayTrips || 0}</Heading>
          </Card>
        </div>

        {balance != null && (
          <Card style={{ marginTop: 12 }}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onNavigate('tab', { id: 'wallet' })}>
              <div>
                <Text size="xs" color="muted">Saldo Dompet</Text>
                <Heading size="sm">Rp {Number(balance).toLocaleString('id-ID')}</Heading>
              </div>
              <ChevronRight size={18} color="var(--ds-color-text-muted)" />
            </Flex>
          </Card>
        )}

        {today?.bonus > 0 && (
          <Card style={{ marginTop: 8, background: 'var(--ds-color-warning-bg, #fffbeb)' }}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="sm" weight="bold">Bonus & Insentif</Text>
              <Text size="sm" weight="bold" color="success">+Rp {(today.bonus || 0).toLocaleString('id-ID')}</Text>
            </Flex>
          </Card>
        )}

        <Heading size="xs" style={{ marginTop: 16, marginBottom: 8 }}>Menu Cepat</Heading>
        <div className="drv-quick-grid">
          <button className="drv-quick-btn" onClick={() => onNavigate('safety')}>
            <div className="drv-quick-btn__icon drv-quick-btn__icon--danger">SOS</div>
            <Text size="xs">Darurat</Text>
          </button>
          <button className="drv-quick-btn" onClick={() => onNavigate('notifications')}>
            <Bell size={22} color="var(--ds-color-primary)" />
            <Text size="xs">Notifikasi</Text>
          </button>
          <button className="drv-quick-btn" onClick={() => onNavigate('tab', { id: 'earnings' })}>
            <DollarSign size={22} color="var(--ds-color-success)" />
            <Text size="xs">Pendapatan</Text>
          </button>
        </div>
      </div>
    </div>
  );
}
