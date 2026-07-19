import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, Avatar } from '../../design-system/index.js';
import { Car, MapPin, Navigation, Clock, Route as RouteIcon, CheckCircle2, Bell } from 'lucide-react';
import BookingMap from '../booking/BookingMap/index.js';
import { useTripRealtime, useTripConnection, CONNECTION } from '../trip/tripRealtime.js';
import ConnectionBanner from './ConnectionBanner.jsx';
import TripSkeleton from './TripSkeleton.jsx';
import './trip.css';

/**
 * DriverArriving (3C-3C) — Passenger Trip: Driver Arriving.
 *
 * Reuses: BookingMap (live DriverMarker via mode="assigned" — marker animates
 * toward the pickup), Avatar (driver), tripRealtime (PickupConfirmed),
 * api.cancelBooking for cancel.
 *
 * Display:
 *   - Driver Marker (live, moving on the map)
 *   - Moving ETA (counts down as the driver approaches)
 *   - Distance (shrinks as driver nears)
 *   - Arrival Progress (bar driven by ETA remaining)
 *   - Pickup Reminder (shown once driver arrives)
 *   - Waiting Timer (counts up after arrival, reminding the passenger)
 *
 * On pickup confirmation (button or PickupConfirmed event) → automatically
 * navigate to Trip In Progress (3D).
 *
 * Moving ETA/Distance/Progress are simulated locally (no live GPS feed in the
 * sample backend); the realtime layer remains the single source of truth for
 * state transitions, so swapping in real telemetry needs no UI changes.
 */
export default function DriverArriving({ booking, driver, onCancel, onPickupConfirmed, loading = false }) {
  const eta0 = Math.max(1, Math.round((driver?.etaMin || 3))); // minutes
  const dist0 = Math.max(0.1, Number(driver?.distanceKm || 0.4)); // km

  const [etaMin, setEtaMin] = useState(eta0);
  const [arrived, setArrived] = useState(false);
  const [waitSec, setWaitSec] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const event = useTripRealtime(booking?.id);
  const { connection, retry } = useTripConnection();

  // Tick: ETA countdown → arrival → waiting timer.
  // Arrival is simulated to complete in a fixed window (ARRIVE_SEC) so the
  // progress/reminder UX is observable without depending on the raw etaMin.
  const ARRIVE_SEC = 10;
  useEffect(() => {
    if (confirmed) return undefined;
    const id = setInterval(() => {
      setEtaMin((e) => {
        if (e <= 0) { setArrived(true); return 0; }
        return Math.max(0, +(e - eta0 / ARRIVE_SEC).toFixed(3));
      });
      if (arrived) setWaitSec((w) => w + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [confirmed, arrived, eta0]);

  // Realtime: backend may push PickupConfirmed (e.g. OTP auto-verify).
  useEffect(() => {
    if (event?.type === 'PickupConfirmed') {
      setConfirmed(true);
      onPickupConfirmed?.(booking, event.payload?.driver || driver);
    }
  }, [event, booking, driver, onPickupConfirmed]);

  if (loading || !driver) {
    return (
      <div className="pasv-trip pasv-trip--arriving">
        <ConnectionBanner connection={connection} onRetry={retry} />
        <TripSkeleton />
      </div>
    );
  }

  const offline = connection !== CONNECTION.ONLINE;

  const confirmPickup = () => {
    if (confirmed) return;
    setConfirmed(true);
    onPickupConfirmed?.(booking, driver);
  };

  // Derived display values.
  const distNow = arrived ? 0 : +(dist0 * (etaMin / eta0)).toFixed(2);
  const progress = Math.min(100, Math.round((1 - etaMin / eta0) * 100));
  const etaLabel = arrived ? 'Tiba' : `${Math.floor(etaMin)} mnt`;
  const waitLabel = formatClock(waitSec);

  return (
    <div className="pasv-trip pasv-trip--arriving">
      <ConnectionBanner connection={connection} onRetry={retry} />
      <header className="pasv-trip__bar">
        <span className="pasv-trip__status" role="status" aria-live="polite">
          <Icon icon={Car} size="xs" /> {arrived ? 'Driver tiba' : 'Driver menuju Anda'}
        </span>
        <h1 className="pasv-trip__title">{arrived ? 'Driver di Titik Jemput' : 'Driver Menuju Lokasi'}</h1>
      </header>

      {/* MAP — live driver marker */}
      <BookingMap
        mode="assigned"
        driver={driver}
        pickup={booking?.pickup}
        destination={booking?.destination}
        onCurrentLocation={() => {}}
        sheetOpen={false}
        height={300}
        loading={offline}
      />

      <main className="pasv-book__scroll pasv-arriving">
        {/* Driver identity */}
        {driver && (
          <section className="pasv-assigned__card">
            <Avatar src={driver.photo} name={driver.name} size="lg" status="online" aria-label={`Foto driver ${driver.name}`} />
            <div className="pasv-assigned__info">
              <div className="pasv-assigned__name">{driver.name}</div>
              <div className="pasv-assigned__rating">
                <Icon icon={Car} size="xs" /> {driver.vehicle} · {driver.plate}
              </div>
            </div>
          </section>
        )}

        {/* ETA + Distance + Arrival Progress */}
        <section className="pasv-arriving__stats" aria-live="polite">
          <div className="pasv-arriving__stat">
            <Icon icon={Clock} size="sm" />
            <span className="pasv-arriving__stat-val">{etaLabel}</span>
            <span className="pasv-arriving__stat-lbl">Estimasi</span>
          </div>
          <div className="pasv-arriving__stat">
            <Icon icon={RouteIcon} size="sm" />
            <span className="pasv-arriving__stat-val">{distNow.toFixed(2)} km</span>
            <span className="pasv-arriving__stat-lbl">Jarak</span>
          </div>
        </section>

        <div className="pasv-arriving__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progres kedatangan driver">
          <span className="pasv-arriving__progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Pickup Reminder + Waiting Timer (after arrival) */}
        {arrived && !confirmed && (
          <div className="pasv-arriving__remind" role="status">
            <Icon icon={Bell} size="sm" />
            <div>
              <p className="pasv-arriving__remind-title">Siap di titik jemput</p>
              <p className="pasv-arriving__remind-sub">Driver menunggu · {waitLabel}</p>
            </div>
          </div>
        )}

        {/* Confirm pickup → continue to Trip In Progress */}
        {arrived && !confirmed && (
          <Button variant="primary" className="pasv-arriving__confirm" onClick={confirmPickup}>
            <Icon icon={CheckCircle2} size="sm" /> Konfirmasi Penjemputan
          </Button>
        )}
        {confirmed && (
          <p className="pasv-assigned__cancelled" role="status">Memulai perjalanan…</p>
        )}

        {/* Route summary */}
        <div className="pasv-wait__route">
          <div className="pasv-trip__leg"><Icon icon={MapPin} size="sm" /> <span>{booking?.pickup?.address || booking?.pickup?.title || 'Jemput'}</span></div>
          <div className="pasv-trip__line" />
          <div className="pasv-trip__leg"><Icon icon={Navigation} size="sm" /> <span>{booking?.destination?.address || booking?.destination?.title || 'Tujuan'}</span></div>
        </div>
      </main>
    </div>
  );
}

function formatClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
