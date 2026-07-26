import React, { useState, useEffect, useCallback } from 'react';
import { BottomNavigation, PageTransition } from '../design-system/index.js';
import { Home, Map, Wallet, TrendingUp, User } from 'lucide-react';
import DriverHome from './DriverHome.jsx';
import TripHistory from './pages/TripHistory.jsx';
import TripDetail from './pages/TripDetail.jsx';
import EarningsPage from './pages/EarningsPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SafetyPage from './pages/SafetyPage.jsx';
import IncomingOrders from './pages/IncomingOrders.jsx';
import ActiveTrip from './pages/ActiveTrip.jsx';
import VehicleManagement from './pages/VehicleManagement.jsx';
import Documents from './pages/Documents.jsx';
import RatingsPage from './pages/RatingsPage.jsx';
import SupportCenter from './pages/SupportCenter.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { tripStore } from './stores/tripStore.js';
import { driverAPI } from './driver-api.js';
import './driver.css';

const MOCK_ORDERS = [
  { id: 'ORD-001', type: 'transport', pickupLabel: 'Jl. Sudirman No. 10', destinationLabel: 'Jl. Thamrin No. 25', estimated_fare: 25000, distance: 3.2, estimated_duration: 12, passenger: { name: 'Budi', rating: 4.8 }, pickup_code: '1234' },
  { id: 'ORD-002', type: 'delivery', pickupLabel: 'Warung Bu Ani', destinationLabel: 'Jl. Merdeka No. 5', estimated_fare: 18000, distance: 2.1, estimated_duration: 8, passenger: { name: 'Siti', rating: 4.5 }, pickup_code: '5678' },
  { id: 'ORD-003', type: 'transport', pickupLabel: 'Mall Kelapa Gading', destinationLabel: 'Kelapa Gading Timur', estimated_fare: 32000, distance: 5.7, estimated_duration: 20, passenger: { name: 'Ahmad', rating: 4.2 }, pickup_code: '9012' },
];

export default function DriverApp({ user, onLogout }) {
  const [view, setView] = useState({ kind: 'tab', id: 'home' });
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  useEffect(() => {
    tripStore.loadActiveTrip().then((trip) => {
      if (trip) {
        setHasActiveTrip(true);
        setView({ kind: 'activeTrip', trip, prevTab: 'home' });
      }
    });
  }, []);

  const spawnMockOrder = useCallback(() => {
    if (incomingOrder || hasActiveTrip || view.kind === 'activeTrip') return;
    const order = MOCK_ORDERS[Math.floor(Math.random() * MOCK_ORDERS.length)];
    setIncomingOrder({ ...order, id: order.id + '-' + Date.now() });
  }, [incomingOrder, hasActiveTrip, view.kind]);

  useEffect(() => {
    const id = setInterval(spawnMockOrder, 45000 + Math.random() * 30000);
    return () => clearInterval(id);
  }, [spawnMockOrder]);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trips', label: 'Trips', icon: Map },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const goTab = (id) => setView({ kind: 'tab', id });

  const goBack = () => {
    if (view.kind === 'tab') return;
    if (view.prevTab) { setView({ kind: 'tab', id: view.prevTab }); return; }
    setView({ kind: 'tab', id: 'home' });
  };

  const navigate = (kind, params = {}) => {
    const current = view.kind === 'tab' ? view.id : 'home';
    setView({ kind, ...params, prevTab: current });
  };

  const handleAcceptOrder = async (orderId) => {
    await tripStore.acceptOrder(orderId);
    setIncomingOrder(null);
    setHasActiveTrip(true);
    navigate('activeTrip', { trip: tripStore.activeTrip || incomingOrder, prevTab: 'home' });
  };

  const handleRejectOrder = (orderId) => {
    setIncomingOrder(null);
  };

  const handleTripUpdate = useCallback((updated) => {
    if (updated?.status === 'completed' || updated?.status === 'cancelled') {
      setHasActiveTrip(false);
    }
  }, []);

  const handleActiveTripBack = useCallback(() => {
    goBack();
  }, [view.kind]);

  const isSubPage = view.kind !== 'tab';
  const showNav = !isSubPage && !hasActiveTrip;

  const renderContent = () => {
    switch (view.kind) {
      case 'tab':
        switch (view.id) {
          case 'trips': return <TripHistory onBack={() => goTab('home')} onDetail={(t) => navigate('tripDetail', { trip: t })} />;
          case 'wallet': return <WalletPage onBack={() => goTab('home')} onHistory={() => navigate('walletHistory')} />;
          case 'earnings': return <EarningsPage onBack={() => goTab('home')} />;
          case 'profile': return <ProfilePage user={user} onLogout={onLogout} onNavigate={navigate} />;
          default: return <DriverHome user={user} onNavigate={navigate} />;
        }
      case 'tripDetail': return <TripDetail trip={view.trip} onBack={goBack} />;
      case 'activeTrip': return (
        <ActiveTrip trip={view.trip} onBack={handleActiveTripBack} onUpdate={handleTripUpdate} tripStore={tripStore} />
      );
      case 'notifications': return <NotificationsPage onBack={goBack} />;
      case 'safety': return <SafetyPage onBack={goBack} />;
      case 'vehicle': return <VehicleManagement vehicle={view.vehicle} onBack={goBack} onSave={() => navigate('tab', { id: 'profile' })} />;
      case 'documents': return <Documents documents={view.documents} onBack={goBack} />;
      case 'ratings': return <RatingsPage stats={view.stats} onBack={goBack} />;
      case 'support': return <SupportCenter onBack={goBack} />;
      case 'settings': return <SettingsPage onBack={goBack} onLogout={onLogout} onNavigate={navigate} />;
      default: return null;
    }
  };

  return (
    <div className="drv-app">
      <PageTransition key={view.kind === 'tab' ? `tab-${view.id}` : view.kind} type="fade">
        {renderContent()}
      </PageTransition>

      {incomingOrder && (
        <IncomingOrders
          order={incomingOrder}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}
          onTimeout={() => setIncomingOrder(null)}
        />
      )}

      {showNav && (
        <BottomNavigation
          items={tabs.map((t) => ({ ...t, active: view.kind === 'tab' && view.id === t.id, onClick: () => goTab(t.id) }))}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30 }}
        />
      )}
    </div>
  );
}
