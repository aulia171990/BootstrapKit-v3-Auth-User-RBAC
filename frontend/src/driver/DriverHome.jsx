import React, { useState, useEffect } from 'react';
import {
  Card, Avatar, Text, Heading, Button, Flex, Stack, Box,
  StatusIndicator, LiveStatusBadge, Spinner
} from '../design-system/index.js';
import { MapPin, DollarSign, ChevronRight, Bell } from 'lucide-react';
import { driverAPI } from './driver-api.js';

export default function DriverHome({ user: propUser, onNavigate }) {
  const [profile, setProfile] = useState(propUser || null);
  const [balance, setBalance] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prof, bal, notif] = await Promise.all([
          driverAPI.profile(),
          driverAPI.earnings(),
          driverAPI.notificationUnread(),
        ]);
        if (cancelled) return;
        setProfile(prof);
        setBalance(bal?.balance ?? bal);
        setUnread(notif?.count ?? notif?.total ?? 0);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Flex style={{ height: '80vh', alignItems: 'center', justifyContent: 'center' }}><Spinner /></Flex>;
  if (error) return <Box p={16}><Text color="danger">Gagal memuat: {error}</Text></Box>;

  return (
    <div className="drv-home" style={{ padding: 16 }}>
      {/* Header */}
      <Flex style={{ alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Avatar size="lg" name={profile?.name} src={profile?.photo} />
        <Box>
          <Heading size="sm">{profile?.name || 'Driver'}</Heading>
          <Text size="xs" color="muted">{profile?.email || 'Tidak ada email'}</Text>
        </Box>
        <Box style={{ marginLeft: 'auto', position: 'relative' }} onClick={() => onNavigate('notifications')}>
          <Bell size={20} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--ds-color-danger)', color: '#fff',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{unread}</span>
          )}
        </Box>
      </Flex>

      {/* Online Status Card */}
      <Card style={{ marginBottom: 16, background: 'var(--ds-color-primary-bg)' }}>
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <LiveStatusBadge status="online" label="Online" />
            {profile?.zone && <Text size="sm" color="muted" style={{ marginTop: 4 }}>Zona: {profile.zone}</Text>}
          </Box>
          <Button variant="outline" size="sm" onClick={() => onNavigate('driverOffline')}>
            Offline
          </Button>
        </Flex>
      </Card>

      {/* Earnings Summary */}
      <Stack gap={12} style={{ marginBottom: 16 }}>
        <Card>
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Text size="xs" color="muted">Saldo Hari Ini</Text>
              <Heading size="md">
                {balance != null
                  ? `Rp ${Number(balance).toLocaleString('id-ID')}`
                  : 'Rp 0'}
              </Heading>
            </Box>
            <DollarSign color="var(--ds-color-primary)" />
          </Flex>
        </Card>
      </Stack>

      {/* Quick Actions */}
      <Heading size="xs" style={{ marginBottom: 10 }}>Menu Cepat</Heading>
      <Stack gap={8}>
        <Button variant="ghost" onClick={() => onNavigate('trips')}>
          <Flex style={{ alignItems: 'center', gap: 10, width: '100%' }}>
            <MapPin size={18} /> <Text>Riwayat Perjalanan</Text>
            <ChevronRight size={18} style={{ marginLeft: 'auto' }} />
          </Flex>
        </Button>
        <Button variant="ghost" onClick={() => onNavigate('earnings')}>
          <Flex style={{ alignItems: 'center', gap: 10, width: '100%' }}>
            <DollarSign size={18} /> <Text>Detail Pendapatan</Text>
            <ChevronRight size={18} style={{ marginLeft: 'auto' }} />
          </Flex>
        </Button>
      </Stack>

      {/* Active Trip Card (if any) */}
      {profile?.active_trip && (
        <Card style={{ marginTop: 16, borderLeft: '4px solid var(--ds-color-primary)' }}>
          <Flex style={{ alignItems: 'center', gap: 12 }}>
            <Box flex={1}>
              <Text size="xs" color="muted">Perjalanan Aktif</Text>
              <Text size="sm" weight="bold">{profile.active_trip.id}</Text>
              <Text size="xs" color="muted">
                {profile.active_trip.origin} → {profile.active_trip.destination}
              </Text>
            </Box>
            <Button size="sm" onClick={() => onNavigate('tripDetail', profile.active_trip.id)}>
              Buka
            </Button>
          </Flex>
        </Card>
      )}
    </div>
  );
}
