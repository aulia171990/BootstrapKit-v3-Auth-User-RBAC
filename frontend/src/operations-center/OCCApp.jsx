import React, { useState } from 'react';
import {
  DashboardLayout, Sidebar, Topbar, Avatar, EmptyState,
} from '../design-system/index.js';
import {
  LayoutDashboard, AlertTriangle, Bell, Truck, Map,
  Radio, Activity, LogOut, AlertCircle, Navigation,
} from 'lucide-react';
import OCCHome from './OCCHome.jsx';
import Incidents from './Incidents.jsx';
import SOSPanel from './SOSPanel.jsx';
import LiveTrips from './LiveTrips.jsx';
import DispatchPanel from './DispatchPanel.jsx';
import DriverStatus from './DriverStatus.jsx';
import './occ.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Ringkasan' },
  { id: 'live-trips', label: 'Live Trips', icon: Map, section: 'Monitoring' },
  { id: 'incidents', label: 'Insiden', icon: AlertTriangle },
  { id: 'sos', label: 'SOS Alert', icon: AlertCircle },
  { id: 'dispatch', label: 'Dispatch', icon: Radio, section: 'Kontrol' },
  { id: 'drivers', label: 'Driver Status', icon: Truck },
  { id: 'alerts', label: 'Notifikasi', icon: Bell, section: 'Lainnya' },
];

export default function OCCApp({ user, onLogout }) {
  const [view, setView] = useState({ kind: 'dashboard' });

  const handleNav = (kind, id) => {
    setView(id ? { kind, id } : { kind });
  };

  const renderView = () => {
    switch (view.kind) {
      case 'dashboard':
        return <OCCHome onNavigate={handleNav} />;
      case 'incidents':
        return <Incidents onNavigate={handleNav} />;
      case 'sos':
        return <SOSPanel onNavigate={handleNav} />;
      case 'live-trips':
        return <LiveTrips onNavigate={handleNav} />;
      case 'dispatch':
        return <DispatchPanel onNavigate={handleNav} />;
      case 'drivers':
        return <DriverStatus onNavigate={handleNav} />;
      default:
        return (
          <EmptyState
            icon={LayoutDashboard}
            title={NAV_ITEMS.find((n) => n.id === view.kind)?.label || view.kind}
            description={`Halaman ${NAV_ITEMS.find((n) => n.id === view.kind)?.label || view.kind} akan segera hadir.`}
          />
        );
    }
  };

  const sidebarItems = NAV_ITEMS.map((item) => ({
    ...item,
    active: view.kind === item.id,
    onClick: () => handleNav(item.id),
  }));

  const sidebarBrand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0 16px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, #dc2626, #f97316)',
        display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 800, fontSize: 16,
      }}>OC</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ds-color-text-strong)' }}>OCC</div>
        <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>Operations Center</div>
      </div>
    </div>
  );

  const initial = (user?.name || user?.email || 'O').trim().charAt(0).toUpperCase();

  return (
    <div className="occ-app">
      <DashboardLayout
        sidebar={
          <Sidebar brand={sidebarBrand} items={sidebarItems} />
        }
        topbar={
          <Topbar
            brand={
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ds-color-text-strong)' }}>
                {NAV_ITEMS.find((n) => n.id === view.kind)?.label || 'Operations Center'}
              </div>
            }
            searchPlaceholder="Cari trip, driver, insiden..."
            notifications={0}
            user={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="sm" name={user?.name || user?.email} />
              </div>
            }
            userMenu={[
              { id: 'profile', label: 'Profil' },
              { id: 'divider' },
              { id: 'logout', label: 'Keluar', onClick: onLogout },
            ]}
          />
        }
      >
        <div style={{ maxWidth: 1400 }}>
          {renderView()}
        </div>
      </DashboardLayout>
    </div>
  );
}
