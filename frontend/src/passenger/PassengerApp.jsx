import React, { useState } from 'react';
import BottomNavigation from '../design-system/components/BottomNavigation/index.js';
import { Home, Clock, Wallet, Bell, User, ChevronLeft, MapPin, Send, CreditCard, History, Tag } from 'lucide-react';
import PassengerHome from './PassengerHome.jsx';
import DestinationSearch from './booking/DestinationSearch.jsx';
import PickupSelection from './booking/PickupSelection.jsx';
import VehicleSelection from './booking/VehicleSelection.jsx';
import FareReview from './booking/FareReview.jsx';
import FareBreakdown from './booking/FareBreakdown.jsx';
import PaymentSelection from './booking/PaymentSelection.jsx';
import BookingReview from './booking/BookingReview.jsx';
import WaitingDriver from './trip/WaitingDriver.jsx';
import DriverAssigned from './trip/DriverAssigned.jsx';
import DriverArriving from './trip/DriverArriving.jsx';
import TripInProgress from './trip/TripInProgress.jsx';
import TripCompleted from './trip/TripCompleted.jsx';
import Receipt from './trip/Receipt.jsx';
import { WalletHome, TransactionHistory, TopUp, PaymentMethods, Promo, WalletSecurity } from './wallet/index.js';
import ActivityHome from './activity/ActivityHome.jsx';
import TripHistory from './activity/TripHistory.jsx';
import TripDetail from './activity/TripDetail.jsx';
import ActivityReceipt from './activity/ActivityReceipt.jsx';
import RepeatBooking from './activity/RepeatBooking.jsx';
import RefundSupport from './activity/RefundSupport.jsx';
import NotificationInbox from './activity/NotificationInbox.jsx';
import NotificationDetail from './activity/NotificationDetail.jsx';
import NotificationPreferences from './activity/NotificationPreferences.jsx';
import { ChatScreen, VoiceCall } from './communication/index.js';
import { SafetyCenter } from './safety/index.js';
import BookingMap from './booking/BookingMap/index.js';
import { EmptyState } from '../design-system/index.js';
import ProfileHome from './profile/ProfileHome.jsx';
import PersonalInformation from './profile/PersonalInformation.jsx';
import SavedAddresses from './profile/SavedAddresses.jsx';
import EmergencyContacts from './profile/EmergencyContacts.jsx';
import ProfilePaymentMethods from './profile/PaymentMethods.jsx';
import Preferences from './profile/Preferences.jsx';
import SecurityCenter from './profile/SecurityCenter.jsx';
import LanguageTheme from './profile/LanguageTheme.jsx';
import AccountManagement from './profile/AccountManagement.jsx';

/**
 * PassengerApp — tenant shell for the Passenger App.
 * Tab state mirrors the existing Admin app's state-router (no router dependency).
 *
 * `view` drives the active screen:
 *   { kind: 'tab', id }              → one of the bottom-nav tabs
 *   { kind: 'destination' }          → 3B-2A Destination Search
 *   { kind: 'pickup', dest }          → 3B-2B Pickup Selection
 *   { kind: 'vehicle', dest, pickup } → 3B-2C Vehicle Selection (uses shared Pricing Engine)
 *   { kind: 'fare', dest, pickup, vehicle, fare, route, surge } → 3B-2D Fare Review
 *   { kind: 'fare2', dest, pickup, vehicle, fare, route, surge } → 3B-2E Fare Breakdown (display only)
 *   { kind: 'pay', dest, pickup, vehicle, fare, route, surge } → 3B-2F Payment Selection (display only)
 *   { kind: 'confirm', payload }      → 3B-2G Booking Review (creates booking)
 *   { kind: 'trip', booking }          → 3C-3A Waiting Driver (after success; stop point of 3B-2G, start of Sprint 3)
 *   { kind: 'tripAssigned', booking, driver } → 3C-3B Driver Assigned (auto-nav from 3A)
 *   { kind: 'tripArriving', booking, driver } → 3C-3C Driver Arriving (auto-nav from 3B)
 *   { kind: 'tripInProgress', booking, driver } → 3C-3D Trip In Progress (auto-nav from 3C)
 *   { kind: 'tripCompleted', booking, driver } → 3C-3G Trip Completed (auto-nav from 3D)
 *   { kind: 'receipt', booking, driver }        → 3C-3H Receipt (nav from 3G)
 *   { kind: 'walletSub', title, icon, text }     → 4A wallet sub-screen placeholder (nav from Wallet Home)
 *   { kind: 'history' }                           → 4B Transaction History (nav from Wallet Home)
 *   { kind: 'topup' }                             → 4C Top Up (nav from Wallet Home)
 *   { kind: 'payment' }                            → 4D Payment Methods (nav from Wallet Home)
 *   { kind: 'promo' }                              → 4E Promo & Voucher (nav from Wallet Home)
 *   { kind: 'security' }                           → 4F Wallet Security (nav from Wallet Home)
 */
export default function PassengerApp({ user, onLogout }) {
  const [view, setView] = useState({ kind: 'tab', id: 'home' });

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notif', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const goTab = (id) => setView({ kind: 'tab', id });

  const profileRoute = (id) => {
    const map = {
      personalInfo: 'profilePersonalInfo', addresses: 'profileAddresses', emergency: 'profileEmergency',
      payments: 'profilePaymentMethods', preferences: 'profilePreferences', security: 'profileSecurity',
      password: 'profileSecurity', twoFactor: 'profileSecurity', devices: 'profileSecurity',
      loginHistory: 'profileSecurity', language: 'profileLanguage', theme: 'profileLanguage',
      accessibility: 'profileLanguage', notifications: 'profilePreferences', help: 'profileAccount',
      account: 'profileAccount', privacy: 'profileAccount', terms: 'profileAccount', about: 'profileAccount',
    };
    const kind = map[id] || id;
    if (kind.startsWith('profile')) setView({ kind });
    else goTab('profile');
  };

  const goHome = (to) => {
    if (typeof to === 'string' && to.startsWith('booking:')) { setView({ kind: 'destination' }); return; }
    if (['activity', 'wallet', 'notifications', 'profile', 'promotions', 'favorites', 'location'].includes(to)) {
      setView({ kind: 'tab', id: to === 'promotions' || to === 'favorites' || to === 'location' ? 'home' : to });
      return;
    }
    setView({ kind: 'tab', id: 'home' });
  };

  const onSelectDestination = (dest) => setView({ kind: 'pickup', dest });
  const onConfirmPickup = (pickup) => setView({ kind: 'vehicle', dest: view.dest, pickup });
  const onConfirmVehicle = (sel) => setView({ kind: 'fare', dest: view.dest, pickup: view.pickup, vehicle: sel.vehicle, fare: sel.fare, route: sel.route, surge: sel.surge });
  const onViewBreakdown = (sel) => setView({ kind: 'fare2', dest: view.dest, pickup: view.pickup, vehicle: sel.vehicle, fare: sel.fare, route: sel.route, surge: sel.surge });
  const onProceedToPayment = (sel) => setView({ kind: 'pay', dest: view.dest, pickup: view.pickup, vehicle: sel.vehicle, fare: sel.fare, route: sel.route, surge: sel.surge });

  return (
    <div className="pasv-app" style={{ paddingBottom: 64 }}>
      {view.kind === 'destination' && (
        <DestinationSearch
          user={user}
          onBack={() => setView({ kind: 'tab', id: 'home' })}
          onSelectDestination={onSelectDestination}
        />
      )}

      {view.kind === 'pickup' && (
        <PickupSelection
          destination={view.dest}
          user={user}
          onBack={() => setView({ kind: 'destination' })}
          onConfirmPickup={onConfirmPickup}
        />
      )}

      {view.kind === 'vehicle' && (
        <VehicleSelection
          destination={view.dest}
          pickup={view.pickup}
          user={user}
          onBack={() => setView({ kind: 'pickup', dest: view.dest })}
          onConfirmVehicle={onConfirmVehicle}
        />
      )}

      {view.kind === 'fare' && (
        <FareReview
          destination={view.dest}
          pickup={view.pickup}
          vehicle={view.vehicle}
          fare={view.fare}
          route={view.route}
          surge={view.surge}
          user={user}
          onBack={() => setView({ kind: 'vehicle', dest: view.dest, pickup: view.pickup })}
          onConfirm={(payload) => setView({ kind: 'confirm', payload })}
          onViewBreakdown={() => onViewBreakdown({ vehicle: view.vehicle, fare: view.fare, route: view.route, surge: view.surge })}
          onProceedToPayment={() => onProceedToPayment({ vehicle: view.vehicle, fare: view.fare, route: view.route, surge: view.surge })}
        />
      )}

      {view.kind === 'fare2' && (
        <FareBreakdown
          vehicle={view.vehicle}
          route={view.route}
          surge={view.surge}
          fare={view.fare}
          onBack={() => setView({ kind: 'fare', dest: view.dest, pickup: view.pickup, vehicle: view.vehicle, fare: view.fare, route: view.route, surge: view.surge })}
        />
      )}

      {view.kind === 'pay' && (
        <PaymentSelection
          vehicle={view.vehicle}
          route={view.route}
          surge={view.surge}
          fare={view.fare}
          user={user}
          onBack={() => setView({ kind: 'fare', dest: view.dest, pickup: view.pickup, vehicle: view.vehicle, fare: view.fare, route: view.route, surge: view.surge })}
          onConfirm={(payload) => setView({ kind: 'confirm', payload })}
        />
      )}

      {view.kind === 'confirm' && (
        <BookingReview
          payload={view.payload}
          onBack={() => setView({ kind: 'pay', dest: view.payload?.destination, pickup: view.payload?.pickup, vehicle: view.payload?.vehicle, fare: view.payload?.fare, route: view.payload?.route, surge: view.payload?.surge })}
          onSuccess={(booking) => setView({ kind: 'trip', booking })}
        />
      )}

      {view.kind === 'trip' && (
        <WaitingDriver
          booking={view.booking}
          onCancel={() => setView({ kind: 'tab', id: 'home' })}
          onDriverAssigned={(booking, driver) => setView({ kind: 'tripAssigned', booking, driver })}
        />
      )}

      {view.kind === 'tripAssigned' && (
        <DriverAssigned
          booking={view.booking}
          driver={view.driver}
          cancelEnabled
          onCancel={() => setView({ kind: 'tab', id: 'home' })}
          onArriving={(booking, driver) => setView({ kind: 'tripArriving', booking, driver })}
          onChat={() => setView({ kind: 'chat', booking: view.booking, driver: view.driver })}
          onCall={() => setView({ kind: 'call', booking: view.booking, driver: view.driver })}
          onSafety={() => setView({ kind: 'safety', booking: view.booking, driver: view.driver })}
        />
      )}

      {view.kind === 'tripArriving' && (
        <DriverArriving
          booking={view.booking}
          driver={view.driver}
          onCancel={() => setView({ kind: 'tab', id: 'home' })}
          onPickupConfirmed={(booking, driver) => setView({ kind: 'tripInProgress', booking, driver })}
        />
      )}

      {view.kind === 'tripInProgress' && (
        <TripInProgress
          booking={view.booking}
          driver={view.driver}
          operator={view.operator}
          onCall={(d) => setView({ kind: 'call', booking: view.booking, driver: d })}
          onChat={(d) => setView({ kind: 'chat', booking: view.booking, driver: d })}
          onSafety={() => setView({ kind: 'safety', booking: view.booking, driver: view.driver })}
          onCancel={() => setView({ kind: 'tab', id: 'home' })}
          onCompleted={(b, p) => setView({ kind: 'tripCompleted', booking: b, driver: view.driver, summary: p })}
          onStopTrip={(b) => view.onStopTrip?.(b)}
        />
      )}

      {view.kind === 'chat' && (
        <ChatScreen
          booking={view.booking}
          driver={view.driver}
          onClose={() => setView({ kind: 'tripInProgress', booking: view.booking, driver: view.driver })}
          onCall={(d) => setView({ kind: 'call', booking: view.booking, driver: d })}
        />
      )}

      {view.kind === 'call' && (
        <VoiceCall
          booking={view.booking}
          driver={view.driver}
          onClose={() => setView({ kind: 'tripInProgress', booking: view.booking, driver: view.driver })}
        />
      )}

      {view.kind === 'safety' && (
        <SafetyCenter
          booking={view.booking}
          driver={view.driver}
          onClose={() => setView({ kind: 'tripInProgress', booking: view.booking, driver: view.driver })}
          onSos={(b, d) => setView({ kind: 'tripInProgress', booking: b, driver: d })}
        />
      )}

      {view.kind === 'tripCompleted' && (
        <TripCompleted
          booking={view.booking}
          driver={view.driver}
          onReceipt={(b, d) => setView({ kind: 'receipt', booking: b, driver: d })}
          onHome={() => setView({ kind: 'tab', id: 'home' })}
        />
      )}

      {view.kind === 'receipt' && (
        <Receipt
          booking={view.booking}
          driver={view.driver}
          onHome={() => setView({ kind: 'tab', id: 'home' })}
          onRepeat={(b, d) => setView({ kind: 'destination', prefill: b })}
          onDownload={() => {}}
          onShare={() => {}}
        />
      )}

      {view.kind === 'walletSub' && (
        <TabPlaceholder title={view.title} icon={view.icon} text={view.text} />
      )}

      {view.kind === 'history' && (
        <TransactionHistory
          onBack={() => setView({ kind: 'tab', id: 'wallet' })}
          onNext={() => setView({ kind: 'payment' })}
          onExportReceipt={() => {}}
        />
      )}

      {view.kind === 'topup' && (
        <TopUp
          onBack={() => setView({ kind: 'tab', id: 'wallet' })}
          onDone={() => setView({ kind: 'payment' })}
          onExportReceipt={() => {}}
        />
      )}

      {view.kind === 'payment' && (
        <PaymentMethods
          onBack={() => setView({ kind: 'tab', id: 'wallet' })}
          onNext={() => setView({ kind: 'promo' })}
          onAdd={() => {}}
          onChanged={() => {}}
        />
      )}

      {view.kind === 'promo' && (
        <Promo
          onBack={() => setView({ kind: 'tab', id: 'wallet' })}
          onNext={() => setView({ kind: 'security' })}
          onChanged={() => {}}
        />
      )}

      {view.kind === 'security' && (
        <WalletSecurity
          onBack={() => setView({ kind: 'tab', id: 'wallet' })}
        />
      )}

      {view.kind === 'tab' && view.id === 'home' && (
        <PassengerHome
          user={user}
          onNavigate={goHome}
          onTopUp={() => goTab('wallet')}
          onWalletHistory={() => goTab('wallet')}
          onSearchDestination={() => setView({ kind: 'destination' })}
          onNotifications={(sub) => goTab(sub === 'profile' ? 'profile' : 'notifications')}
        />
      )}
      {view.kind === 'tab' && view.id === 'activity' && (
        <ActivityHome
          onTripDetail={(t) => setView({ kind: 'history', selected: t })}
          onOngoingTrip={() => goTab('activity')}
          onPaymentDetail={() => goTab('wallet')}
          onFavoriteTrip={(f) => setView({ kind: 'repeat', prefill: f })}
          onViewAllTrips={() => setView({ kind: 'history' })}
          onViewAllPayments={() => setView({ kind: 'history' })}
          onFilter={() => setView({ kind: 'history' })}
          onSearch={() => setView({ kind: 'history' })}
          onRefundSupport={() => setView({ kind: 'refund' })}
          onRetry={() => {}}
        />
      )}
      {view.kind === 'history' && (
        <TripHistory
          onBack={() => goTab('activity')}
          onTripDetail={(t) => setView({ kind: 'detail', selected: t })}
          onFavoriteTrip={(f) => setView({ kind: 'repeat', prefill: f })}
          onReceipt={(t) => setView({ kind: 'receipt', tripId: t?.id })}
          onRepeat={(t) => setView({ kind: 'repeat', trip: t })}
          onSort={() => {}}
          onRetry={() => {}}
        />
      )}
      {view.kind === 'detail' && (
        <TripDetail
          trip={view.selected}
          onBack={() => setView({ kind: 'history' })}
          onRepeatBooking={(t) => setView({ kind: 'repeat', trip: t })}
          onSupport={(t, mode) => setView({ kind: 'refund', trip: t })}
          onReceipt={(t) => setView({ kind: 'receipt', tripId: t?.id })}
          onShare={(t) => setView({ kind: 'receipt', tripId: t?.id })}
          onRate={(id, value) => {}}
          onRetry={() => {}}
        />
      )}
      {view.kind === 'receipt' && (
        <ActivityReceipt
          tripId={view.tripId}
          onBack={() => setView({ kind: 'detail', selected: { id: view.tripId } })}
          onDownload={() => {}}
          onShare={() => {}}
          onEmail={() => {}}
        />
      )}
      {view.kind === 'repeat' && (
        <RepeatBooking
          trip={view.trip}
          prefill={view.prefill}
          onBack={() => view.trip ? setView({ kind: 'detail', selected: view.trip }) : setView({ kind: 'history' })}
          onProceed={(sel) => setView({ kind: 'vehicle', dest: sel.destination, pickup: sel.pickup, vehicle: sel.vehicle, fare: sel.fare, route: sel.route, surge: sel.surge })}
        />
      )}
      {view.kind === 'refund' && (
        <RefundSupport
          trip={view.trip}
          onBack={() => view.trip ? setView({ kind: 'detail', selected: view.trip }) : goTab('activity')}
          onContactSupport={(t, mode) => setView({ kind: 'support', trip: t, mode })}
          onDispute={(t) => { papi.submitTripDispute(t?.id, { reason: 'Sengketa perjalanan', detail: '' }).then(() => setView({ kind: 'refund', trip: t })); }}
          onHelpArticle={() => {}}
        />
      )}
      {view.kind === 'support' && (
        <ChatScreen
          booking={{ id: 'support' }}
          driver={{ name: 'Customer Support', vehicle: 'Layanan Pelanggan', photo: null }}
          onClose={() => view.trip ? setView({ kind: 'refund', trip: view.trip }) : goTab('activity')}
          onCall={() => {}}
        />
      )}
      {view.kind === 'tab' && view.id === 'wallet' && (
        <WalletHome
          onTopUp={() => setView({ kind: 'topup' })}
          onTransfer={() => setView({ kind: 'walletSub', title: 'Transfer', icon: Send, text: 'Kirim saldo ke pengguna lain (segera hadir).' })}
          onPaymentMethods={() => setView({ kind: 'payment' })}
          onHistory={() => setView({ kind: 'history' })}
          onSecurity={() => setView({ kind: 'security' })}
          onPromo={() => setView({ kind: 'promo' })}
          onRefresh={() => {}}
          onRetry={() => {}}
          onPickPayment={(sel) => setView({ kind: 'topup', prefill: sel })}
        />
      )}
      {view.kind === 'tab' && view.id === 'notifications' && (
        <NotificationInbox
          onOpen={(n) => setView({ kind: 'notificationDetail', notification: n })}
          onPreferences={() => setView({ kind: 'notificationPreferences' })}
        />
      )}
      {view.kind === 'notificationPreferences' && (
        <NotificationPreferences
          onBack={() => setView({ kind: 'tab', id: 'notifications' })}
        />
      )}
      {view.kind === 'notificationDetail' && (
        <NotificationDetail
          notification={view.notification}
          onBack={() => setView({ kind: 'tab', id: 'notifications' })}
          onOpenRelated={(n) => {
            const d = n?.data || {};
            if (d.type === 'trip' && d.id) setView({ kind: 'detail', selected: { id: d.id } });
            else if (d.type === 'promotion' && d.id) setView({ kind: 'promo' });
            else if (d.type === 'wallet' || d.type === 'payment') setView({ kind: 'wallet' });
            else if (d.type === 'support' || d.type === 'refund') setView({ kind: 'refund', trip: d.id ? { id: d.id } : undefined });
            else if (d.type === 'chat') setView({ kind: 'chat', booking: d.id ? { id: d.id } : undefined });
            else setView({ kind: 'tab', id: 'notifications' });
          }}
          onShare={() => {}}
        />
      )}
      {view.kind === 'tab' && view.id === 'profile' && (
        <ProfileHome
          user={user}
          onNavigate={profileRoute}
          onLogout={onLogout}
        />
      )}
      {view.kind === 'profilePersonalInfo' && (
        <PersonalInformation
          user={user}
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profileAddresses' && (
        <SavedAddresses
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profileEmergency' && (
        <EmergencyContacts
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profilePaymentMethods' && (
        <ProfilePaymentMethods
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profilePreferences' && (
        <Preferences
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profileSecurity' && (
        <SecurityCenter
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profileLanguage' && (
        <LanguageTheme
          onBack={() => goTab('profile')}
        />
      )}
      {view.kind === 'profileAccount' && (
        <AccountManagement
          onBack={() => goTab('profile')}
          onLogout={onLogout}
        />
      )}

      <BottomNavigation
        items={tabs.map((t) => ({ ...t, active: view.kind === 'tab' && view.id === t.id, onClick: () => goTab(t.id) }))}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30 }}
      />
    </div>
  );
}

function TabPlaceholder({ title, icon, text }) {
  return (
    <div className="pasv-app">
      <header className="pasv-appbar"><h1 className="pasv-greeting" style={{ fontSize: 'var(--ds-text-body-size)' }}>{title}</h1></header>
      <main className="pasv-scroll">
        <EmptyState icon={icon} title={title} description={text} />
      </main>
    </div>
  );
}

// 3C-3A end point within this phase. After a successful booking the shell
// navigates to WaitingDriver (see WaitingDriver.jsx); on DriverAssigned it
// auto-navigates to DriverAssigned. Live trip tracking continues in later 3C phases.
