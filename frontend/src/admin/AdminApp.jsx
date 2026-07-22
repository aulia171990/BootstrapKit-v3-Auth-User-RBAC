import React, { useState } from 'react';
import {
  DashboardLayout, Sidebar, Topbar, Icon, Avatar, Button, EmptyState, ErrorState,
} from '../design-system/index.js';
import {
  LayoutDashboard, Users, Truck, BookOpen, Map, CreditCard, Wallet,
  Percent, BarChart3, FileText, Activity, Settings, Bell, Search,
  LogOut, ChevronLeft, Menu, X,
} from 'lucide-react';
import DashboardHome from './DashboardHome.jsx';
import Customers from './Customers.jsx';
import CustomerDetail from './CustomerDetail.jsx';
import Drivers from './Drivers.jsx';
import DriverDetail from './DriverDetail.jsx';
import Bookings from './Bookings.jsx';
import BookingDetail from './BookingDetail.jsx';
import Trips from './Trips.jsx';
import TripDetail from './TripDetail.jsx';
import Payments from './Payments.jsx';
import PaymentDetail from './PaymentDetail.jsx';
import WalletPage from './Wallet.jsx';
import WalletDetail from './WalletDetail.jsx';
import Promotion from './Promotion.jsx';
import PromotionDetail from './PromotionDetail.jsx';
import Monitoring from './Monitoring.jsx';
import './admin.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu Utama' },
  { id: 'customers', label: 'Customers', icon: Users, section: 'Manajemen' },
  { id: 'drivers', label: 'Drivers', icon: Truck },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'trips', label: 'Trips', icon: Map },
  { id: 'payments', label: 'Payments', icon: CreditCard, section: 'Keuangan' },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'promotion', label: 'Promotion', icon: Percent, section: 'Pemasaran' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Analisis' },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, section: 'Operasional' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'Sistem' },
];

const SECTION_LABELS = {
  'Menu Utama': 'Menu Utama',
  'Manajemen': 'Manajemen',
  'Keuangan': 'Keuangan',
  'Pemasaran': 'Pemasaran',
  'Analisis': 'Analisis',
  'Operasional': 'Operasional',
  'Sistem': 'Sistem',
};

export default function AdminApp({ me, onLogout }) {
  const [view, setView] = useState({ kind: 'dashboard' });

  const handleNav = (kind, id) => {
    if (id) {
      setView({ kind, id });
    } else {
      setView({ kind });
    }
  };

  const renderView = () => {
    switch (view.kind) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNav} />;
      case 'customers':
        return <Customers onNavigate={handleNav} />;
      case 'customerDetail':
        return (
          <CustomerDetail
            customerId={view.id}
            onBack={() => handleNav('customers')}
            onNavigate={handleNav}
          />
        );
      case 'drivers':
        return <Drivers onNavigate={handleNav} />;
      case 'driverDetail':
        return (
          <DriverDetail
            driverId={view.id}
            onBack={() => handleNav('drivers')}
            onNavigate={handleNav}
          />
        );
      case 'bookings':
        return <Bookings onNavigate={handleNav} />;
      case 'bookingDetail':
        return (
          <BookingDetail
            bookingId={view.id}
            onBack={() => handleNav('bookings')}
            onNavigate={handleNav}
          />
        );
      case 'trips':
        return <Trips onNavigate={handleNav} />;
      case 'tripDetail':
        return (
          <TripDetail
            tripId={view.id}
            onBack={() => handleNav('trips')}
            onNavigate={handleNav}
          />
        );
      case 'payments':
        return <Payments onNavigate={handleNav} />;
      case 'paymentDetail':
        return (
          <PaymentDetail
            paymentId={view.id}
            onBack={() => handleNav('payments')}
            onNavigate={handleNav}
          />
        );
      case 'wallet':
        return <WalletPage onNavigate={handleNav} />;
      case 'walletDetail':
        return (
          <WalletDetail
            txId={view.id}
            onBack={() => handleNav('wallet')}
            onNavigate={handleNav}
          />
        );
      case 'promotion':
        return <Promotion onNavigate={handleNav} />;
      case 'promotionDetail':
        return (
          <PromotionDetail
            promoId={view.id}
            onBack={() => handleNav('promotion')}
            onNavigate={handleNav}
          />
        );
      case 'monitoring':
        return <Monitoring />;
      default:
        return (
          <EmptyState
            icon={LayoutDashboard}
            title={NAV_ITEMS.find((n) => n.id === view.kind)?.label || view.kind}
            description={`Halaman ${NAV_ITEMS.find((n) => n.id === view.kind)?.label || view.kind} akan segera hadir. Sprint berikutnya.`}
          />
        );
    }
  };

  const initial = (me?.name || me?.email || 'A').trim().charAt(0).toUpperCase();

  const sidebarItems = NAV_ITEMS.map((item) => ({
    ...item,
    active: view.kind === item.id ||
      (view.kind === 'customerDetail' && item.id === 'customers') ||
      (view.kind === 'driverDetail' && item.id === 'drivers') ||
      (view.kind === 'bookingDetail' && item.id === 'bookings') ||
      (view.kind === 'tripDetail' && item.id === 'trips') ||
      (view.kind === 'paymentDetail' && item.id === 'payments') ||
      (view.kind === 'walletDetail' && item.id === 'wallet') ||
      (view.kind === 'promotionDetail' && item.id === 'promotion'),
    onClick: () => handleNav(item.id),
  }));

  const sidebarBrand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0 16px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--ds-color-primary, #4f46e5)',
        display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 800, fontSize: 16,
      }}>O</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ds-color-text-strong)' }}>Ojol</div>
        <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>Admin Panel</div>
      </div>
    </div>
  );

  const topbarBrand = (
    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ds-color-text-strong)' }}>
      {view.kind === 'customerDetail' ? 'Detail Pelanggan' : view.kind === 'driverDetail' ? 'Detail Driver' : view.kind === 'bookingDetail' ? 'Detail Booking' : view.kind === 'tripDetail' ? 'Detail Trip' : view.kind === 'paymentDetail' ? 'Detail Pembayaran' : view.kind === 'walletDetail' ? 'Detail Transaksi' : view.kind === 'promotionDetail' ? 'Detail Promo' : NAV_ITEMS.find((n) => n.id === view.kind)?.label || 'Dashboard'}
    </div>
  );

  const userDropdown = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <Avatar size="sm" name={me?.name || me?.email} />
      <div style={{ display: 'none' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{me?.name || 'Admin'}</div>
        <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>{me?.email || ''}</div>
      </div>
    </div>
  );

  const userMenu = [
    { id: 'profile', label: 'Profil' },
    { id: 'settings', label: 'Pengaturan' },
    { id: 'divider' },
    { id: 'logout', label: 'Keluar', onClick: onLogout },
  ];

  return (
    <div className="admin-app">
      <DashboardLayout
        sidebar={
          <Sidebar
            brand={sidebarBrand}
            items={sidebarItems}
          />
        }
        topbar={
          <Topbar
            brand={topbarBrand}
            searchPlaceholder="Cari menu, driver, pelanggan..."
            notifications={3}
            user={userDropdown}
            userMenu={userMenu}
          />
        }
      >
        <div style={{ maxWidth: 1200 }}>
          {renderView()}
        </div>
      </DashboardLayout>
    </div>
  );
}
