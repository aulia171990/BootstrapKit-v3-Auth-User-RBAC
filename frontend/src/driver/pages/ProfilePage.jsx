import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Heading, Flex, Avatar, Loading, ErrorState, Skeleton } from '../../design-system/index.js';
import { ChevronLeft, User, Phone, Mail, Shield, Star, Truck, FileText, AlertTriangle, LogOut } from 'lucide-react';
import { driverAPI } from '../driver-api.js';

const MENU_ITEMS = [
  { id: 'personal', label: 'Informasi Pribadi', icon: User },
  { id: 'vehicle', label: 'Kendaraan', icon: Truck },
  { id: 'documents', label: 'Dokumen', icon: FileText },
  { id: 'ratings', label: 'Rating & Ulasan', icon: Star },
  { id: 'safety', label: 'Keselamatan & SOS', icon: AlertTriangle, danger: true },
  { id: 'divider' },
  { id: 'settings', label: 'Pengaturan', icon: Shield },
  { id: 'support', label: 'Pusat Bantuan', icon: FileText },
  { id: 'divider' },
  { id: 'logout', label: 'Keluar', icon: LogOut },
];

export default function ProfilePage({ user, driver, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) { setLoading(true); driverAPI.profile().then(setProfile).finally(() => setLoading(false)); }
    driverAPI.driverStatus().then(setStats).catch(() => {});
  }, []);

  if (loading && !profile) return <div style={{ padding: 40 }}><Skeleton variant="card" lines={5} /></div>;

  const handleMenu = (id) => {
    if (id === 'logout') onLogout?.();
    else onNavigate?.(id);
  };

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={() => onNavigate?.('home')}><ChevronLeft size={20} /></button>
        <h2>Profil</h2>
      </header>

      <div className="drv-page-body">
        <Card style={{ marginBottom: 16 }}>
          <Flex style={{ alignItems: 'center', gap: 12 }}>
            <Avatar size="xl" name={profile?.name} />
            <div>
              <Heading size="sm">{profile?.name || 'Driver'}</Heading>
              <Flex gap={4} style={{ alignItems: 'center', marginTop: 4 }}>
                <Star size={14} color="var(--ds-color-warning)" />
                <Text size="sm">{stats?.rating ? stats.rating.toFixed(1) : '—'}</Text>
                <Text size="xs" color="muted" style={{ marginLeft: 8 }}>#{stats?.driverCode || ''}</Text>
              </Flex>
              <Flex gap={4} style={{ alignItems: 'center', marginTop: 2 }}>
                <Shield size={12} color="var(--ds-color-success)" />
                <Text size="xs" color="muted">Terverifikasi</Text>
              </Flex>
            </div>
          </Flex>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Flex gap={12} style={{ marginBottom: 8 }}>
            <Phone size={14} color="var(--ds-color-text-muted)" />
            <Text size="sm">{profile?.phone || '—'}</Text>
          </Flex>
          <Flex gap={12}>
            <Mail size={14} color="var(--ds-color-text-muted)" />
            <Text size="sm">{profile?.email || '—'}</Text>
          </Flex>
        </Card>

        {stats?.vehicle && (
          <Card style={{ marginBottom: 16 }}>
            <Heading size="xs" style={{ marginBottom: 8 }}>Kendaraan</Heading>
            <Text size="sm">{stats.vehicle.model || stats.vehicle.type || '—'}</Text>
            <Text size="xs" color="muted">{stats.vehicle.plate || ''}</Text>
          </Card>
        )}

        <Card>
          {MENU_ITEMS.map((item, index) =>
            item.id === 'divider' ? (
              <div key={`divider-${index}`} style={{ height: 1, background: 'var(--ds-color-border)', margin: '8px 0' }} />
            ) : (
              <button key={item.id} className="drv-menu-row" onClick={() => handleMenu(item.id)}>
                <Flex gap={12} style={{ alignItems: 'center', width: '100%' }}>
                  <item.icon size={18} color={item.danger ? 'var(--ds-color-danger)' : 'var(--ds-color-text-muted)'} />
                  <Text size="sm" color={item.danger ? 'danger' : undefined}>{item.label}</Text>
                </Flex>
              </button>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
