import React, { useState } from 'react';
import { BottomNavigation, Avatar, Text, Heading, Button, Card, Flex, Stack, Box } from '../design-system/index.js';
import { Home, Clock, Wallet, Bell, User, Truck, Map, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import DriverHome from './DriverHome.jsx';

export default function DriverApp({ user, onLogout }) {
  const [view, setView] = useState({ kind: 'tab', id: 'home' });

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trips', label: 'Trips', icon: Map },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const goTab = (id) => setView({ kind: 'tab', id });

  return (
    <div className="drv-app" style={{ paddingBottom: 64 }}>
      {view.kind === 'tab' && view.id === 'home' && (
        <DriverHome user={user} onNavigate={goTab} />
      )}
      
      {/* Other views will go here */}

      <BottomNavigation
        items={tabs.map((t) => ({ ...t, active: view.kind === 'tab' && view.id === t.id, onClick: () => goTab(t.id) }))}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30 }}
      />
    </div>
  );
}
