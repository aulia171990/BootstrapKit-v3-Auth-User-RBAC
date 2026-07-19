import React, { useEffect, useState } from 'react';
import { Button, Icon, Avatar, LiveStatusBadge } from '../../design-system/index.js';
import { Car, Star, MapPin, Navigation, Phone, MessageCircle, X, Radio, Shield, Clock } from 'lucide-react';
import BookingMap from '../booking/BookingMap/index.js';
import { useTripRealtime } from '../trip/tripRealtime.js';
import { useUnread } from '../communication/index.js';
import * as papi from '../api.js';
import './trip.css';

/**
 * DriverAssigned (3C-3B) — Passenger Trip: Driver Assigned.
 *
 * Reuses: Driver module (Avatar photo, rating, vehicle, plate), BookingMap
 * (live DriverMarker via mode="assigned"), tripRealtime (DriverArriving),
 * api.cancelBooking.
 *
 * Display: Driver Card (photo, rating, vehicle, plate, ETA), Live Driver
 * Location (map), Call + Chat actions, Cancel (configurable).
 *
 * On DriverArriving event → navigate automatically to Driver Arriving (3C).
 *
 * No business logic duplicated — data comes from the trip realtime client +
 * api layer.
 *
 * @param {object} booking
 * @param {object} driver
 * @param {boolean} cancelEnabled  show/enable the Cancel action (default true)
 * @param {()=>void} onCancel
 * @param {(b,d)=>void} onArriving   navigate to Driver Arriving
 * @param {(driver)=>void} onCall    open call (Communication 3E)
 * @param {(driver)=>void} onChat    open chat (Communication 3E)
 * @param {()=>void} onSafety        open Safety Center (3F)
 */
export default function DriverAssigned({
  booking, driver, cancelEnabled = true, onCancel, onArriving, onCall, onChat, onSafety,
}) {
  const [uiState, setUiState] = useState('assigned'); // assigned | cancelled | error
  const [cancelBusy, setCancelBusy] = useState(false);

  const event = useTripRealtime(booking?.id);
  const unread = useUnread(booking?.id);

  useEffect(() => {
    if (!event) return;
    switch (event.type) {
      case 'DriverArriving':
        onArriving?.(booking, event.payload?.driver || driver);
        break;
      case 'BookingCancelled':
        setUiState('cancelled');
        break;
      default:
        break;
    }
  }, [event, booking, driver, onArriving]);

  const cancel = async () => {
    if (cancelBusy || !cancelEnabled) return;
    setCancelBusy(true);
    try {
      await papi.cancelBooking(booking?.id, 'passenger');
      setUiState('cancelled');
      onCancel?.(booking);
    } catch (e) {
      setUiState('error');
    } finally {
      setCancelBusy(false);
    }
  };

  const plate = driver?.plate || '—';
  const rating = typeof driver?.rating === 'number' ? driver.rating.toFixed(1) : '—';
  const eta = driver?.etaMin != null ? `${driver.etaMin} mnt` : '—';

  return (
    <div className="pasv-trip pasv-trip--assigned">
      <header className="pasv-trip__bar">
        <span className="pasv-trip__status" role="status" aria-live="polite">
          <Icon icon={Radio} size="xs" /> Driver menuju lokasi
        </span>
        <h1 className="pasv-trip__title">Driver Ditemukan</h1>
      </header>

      {/* MAP — live driver location */}
      <BookingMap
        mode="assigned"
        driver={driver}
        pickup={booking?.pickup}
        destination={booking?.destination}
        onCurrentLocation={() => {}}
        sheetOpen={false}
        height={300}
      />

      <main className="pasv-book__scroll pasv-assigned">
        {/* Driver Card */}
        {driver && (
          <section className="pasv-assigned__card">
            <Avatar
              src={driver.photo}
              name={driver.name}
              size="lg"
              status="online"
              aria-label={`Foto driver ${driver.name}`}
            />
            <div className="pasv-assigned__info">
              <div className="pasv-assigned__name">{driver.name}</div>
              <div className="pasv-assigned__rating">
                <Icon icon={Star} size="xs" /> {rating}
                <span className="pasv-assigned__sep">·</span>
                <Icon icon={Clock} size="xs" /> {eta}
              </div>
              <div className="pasv-assigned__veh">
                <Icon icon={Car} size="xs" /> {driver.vehicle} · {plate}
              </div>
            </div>
            <LiveStatusBadge status="online" label="Online" />
          </section>
        )}

        {/* Quick actions: Call + Chat */}
        <div className="pasv-assigned__actions">
          <Button variant="primary" className="pasv-assigned__act" onClick={() => onCall?.(driver)} aria-label={`Telepon ${driver?.name || 'driver'}`}>
            <Icon icon={Phone} size="sm" /> Telepon
          </Button>
          <Button variant="outline" className="pasv-assigned__act" onClick={() => onChat?.(driver)} aria-label={`Chat ${driver?.name || 'driver'}`}>
            <Icon icon={MessageCircle} size="sm" /> Chat
            {unread > 0 && <span className="pasv-badge" aria-label={`${unread} pesan belum dibaca`}>{unread > 9 ? '9+' : unread}</span>}
          </Button>
          <Button variant="outline" className="pasv-assigned__act pasv-assigned__act--safety" onClick={() => onSafety?.()} aria-label="Buka Pusat Keamanan">
            <Icon icon={Shield} size="sm" /> Aman
          </Button>
        </div>

        {/* Route summary */}
        <div className="pasv-wait__route">
          <div className="pasv-trip__leg"><Icon icon={MapPin} size="sm" /> <span>{booking?.pickup?.address || booking?.pickup?.title || 'Jemput'}</span></div>
          <div className="pasv-trip__line" />
          <div className="pasv-trip__leg"><Icon icon={Navigation} size="sm" /> <span>{booking?.destination?.address || booking?.destination?.title || 'Tujuan'}</span></div>
        </div>

        {/* Cancel (configurable) */}
        {cancelEnabled && uiState === 'assigned' && (
          <button type="button" className="pasv-trip__cancel" onClick={cancel} disabled={cancelBusy}>
            {cancelBusy ? 'Membatalkan…' : 'Batalkan pesanan'}
          </button>
        )}
        {uiState === 'cancelled' && (
          <p className="pasv-assigned__cancelled" role="status">Pesanan dibatalkan.</p>
        )}
        {uiState === 'error' && (
          <p className="pasv-assigned__cancelled pasv-assigned__cancelled--err" role="alert">Gagal membatalkan pesanan.</p>
        )}
      </main>
    </div>
  );
}
