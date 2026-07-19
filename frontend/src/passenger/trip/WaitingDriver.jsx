import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '../../design-system/index.js';
import { Loader2, MapPin, Navigation, Clock, Search, X, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import BookingMap from '../booking/BookingMap/index.js';
import { useTripRealtime } from '../trip/tripRealtime.js';
import * as papi from '../api.js';
import './trip.css';

/**
 * WaitingDriver (3C-3A) — Passenger Trip: Waiting for Driver.
 *
 * Starts right after a booking is confirmed. Reuses:
 *   - BookingMap (Pickup Marker, Searching Radius ring, Current Location, Zoom)
 *   - tripRealtime (subscribe to BookingAccepted/DriverAssigned/DispatchRetry/
 *     BookingCancelled/BookingExpired)
 *   - api.cancelBooking (Cancel Booking)
 *
 * State machine: searching → (retry) | (cancelled) | (timeout) | (error)
 *                → on DriverAssigned, navigate automatically to Driver Assigned.
 *
 * No business logic duplicated — all realtime/driver/booking lives in the
 * trip client + api layer.
 */
const ESTIMATED_WAIT_SEC = 30;

export default function WaitingDriver({ booking, onCancel, onDriverAssigned }) {
  const [uiState, setUiState] = useState('searching'); // searching | cancelled | timeout | error
  const [attempt, setAttempt] = useState(0);
  const [remaining, setRemaining] = useState(ESTIMATED_WAIT_SEC);
  const [cancelBusy, setCancelBusy] = useState(false);

  const event = useTripRealtime(booking?.id);
  const timerRef = useRef(null);

  // Countdown + timeout (passes through events; if no driver in time → timeout).
  useEffect(() => {
    if (uiState !== 'searching') return undefined;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          setUiState('timeout');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [uiState]);

  // React to realtime events.
  useEffect(() => {
    if (!event) return;
    switch (event.type) {
      case 'DispatchRetry':
        setAttempt(event.payload?.attempt || attempt + 1);
        setRemaining(event.payload?.nextEtaSec || ESTIMATED_WAIT_SEC);
        setUiState('searching');
        break;
      case 'BookingCancelled':
        setUiState('cancelled');
        break;
      case 'BookingExpired':
        setUiState('timeout');
        break;
      case 'DriverAssigned':
        // Navigate automatically to Driver Assigned screen.
        onDriverAssigned?.(booking, event.payload?.driver);
        break;
      default:
        break;
    }
  }, [event, attempt, booking, onDriverAssigned]);

  const cancel = async () => {
    if (cancelBusy) return;
    setCancelBusy(true);
    try {
      await papi.cancelBooking(booking?.id);
      setUiState('cancelled');
      onCancel?.(booking);
    } catch (e) {
      setUiState('error');
    } finally {
      setCancelBusy(false);
    }
  };

  const retry = () => {
    setAttempt(0);
    setRemaining(ESTIMATED_WAIT_SEC);
    setUiState('searching');
  };

  const heading = useMemo(() => {
    switch (uiState) {
      case 'cancelled': return 'Pesanan dibatalkan';
      case 'timeout': return 'Tidak ada driver ditemukan';
      case 'error': return 'Terjadi kesalahan';
      default: return 'Mencari Driver';
    }
  }, [uiState]);

  return (
    <div className="pasv-trip pasv-trip--waiting">
      <header className="pasv-trip__bar">
        <span className="pasv-trip__status" role="status" aria-live="polite">
          <Icon icon={Radio} size="xs" /> {booking?.id || '—'}
        </span>
        <h1 className="pasv-trip__title">{heading}</h1>
      </header>

      {/* MAP (reused): Pickup Marker + Searching Radius + Current Location */}
      <BookingMap
        mode="waiting"
        pickup={booking?.pickup}
        destination={booking?.destination}
        onCurrentLocation={() => {}}
        sheetOpen={false}
        height={300}
      />

      <main className="pasv-book__scroll pasv-wait">
        {/* Booking status + searching + animated progress */}
        {uiState === 'searching' && (
          <section className="pasv-wait__panel">
            <div className="pasv-wait__pulse" aria-hidden="true">
              <Loader2 className="pasv-trip__spin" size="xl" />
            </div>
            <p className="pasv-wait__lead">Sedang mencari driver terdekat…</p>
            <p className="pasv-wait__eta">
              <Icon icon={Clock} size="sm" /> Estimasi tunggu <strong>{formatCountdown(remaining)}</strong>
            </p>
            <div className="pasv-wait__progress" role="progressbar" aria-valuemin={0} aria-valuemax={ESTIMATED_WAIT_SEC} aria-valuenow={ESTIMATED_WAIT_SEC - remaining} aria-label="Progres pencarian driver">
              <span className="pasv-wait__progress-bar" style={{ width: `${Math.min(100, ((ESTIMATED_WAIT_SEC - remaining) / ESTIMATED_WAIT_SEC) * 100)}%` }} />
            </div>
            {attempt > 0 && (
              <p className="pasv-wait__retry-note">
                <Icon icon={RefreshCw} size="xs" /> Mencoba ulang ke-{attempt}…
              </p>
            )}
            <button type="button" className="pasv-trip__cancel pasv-wait__cancel" onClick={cancel} disabled={cancelBusy}>
              {cancelBusy ? 'Membatalkan…' : 'Batalkan pesanan'}
            </button>
          </section>
        )}

        {/* Retry (timeout) */}
        {uiState === 'timeout' && (
          <StateBlock
            icon={Search}
            title="Waktu pencarian habis"
            body="Tidak ada driver yang mengambil pesanan dalam waktu yang ditentukan. Coba lagi atau batalkan."
            actions={(
              <>
                <Button variant="primary" onClick={retry}><Icon icon={RefreshCw} size="sm" /> Coba lagi</Button>
                <Button variant="outline" onClick={cancel} disabled={cancelBusy}>Batalkan</Button>
              </>
            )}
          />
        )}

        {/* Cancelled */}
        {uiState === 'cancelled' && (
          <StateBlock
            icon={X}
            title="Pesanan dibatalkan"
            body="Pesanan telah dibatalkan. Anda dapat membuat pesanan baru kapan saja."
            actions={<Button variant="primary" onClick={() => onCancel?.(booking)}>Kembali ke beranda</Button>}
          />
        )}

        {/* Error */}
        {uiState === 'error' && (
          <StateBlock
            icon={AlertTriangle}
            tone="danger"
            title="Gagal membatalkan pesanan"
            body="Terjadi kesalahan. Silakan coba lagi."
            actions={<Button variant="primary" onClick={cancel}><Icon icon={RefreshCw} size="sm" /> Coba lagi</Button>}
          />
        )}

        {/* Route summary (always visible) */}
        {booking && (uiState === 'searching' || uiState === 'timeout') && (
          <div className="pasv-wait__route">
            <div className="pasv-trip__leg"><Icon icon={MapPin} size="sm" /> <span>{booking.pickup?.address || booking.pickup?.title || 'Jemput'}</span></div>
            <div className="pasv-trip__line" />
            <div className="pasv-trip__leg"><Icon icon={Navigation} size="sm" /> <span>{booking.destination?.address || booking.destination?.title || 'Tujuan'}</span></div>
          </div>
        )}
      </main>
    </div>
  );
}

function StateBlock({ icon: Ico, title, body, actions, tone = 'primary' }) {
  return (
    <section className={`pasv-wait__panel pasv-wait__panel--${tone}`}>
      <div className="pasv-wait__pulse"><Icon icon={Ico} size="xl" /></div>
      <h2 className="pasv-wait__lead">{title}</h2>
      <p className="pasv-wait__body">{body}</p>
      <div className="pasv-wait__actions">{actions}</div>
    </section>
  );
}

function formatCountdown(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
