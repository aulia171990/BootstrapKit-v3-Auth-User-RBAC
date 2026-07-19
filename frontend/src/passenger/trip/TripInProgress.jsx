import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, Avatar, StatusIndicator } from '../../design-system/index.js';
import { Navigation, MapPin, Car, Clock, Route as RouteIcon, Share2, Phone, MessageCircle, Square, Shield, CheckCircle2 } from 'lucide-react';
import BookingMap from '../booking/BookingMap/index.js';
import { useTripRealtime } from '../trip/tripRealtime.js';
import { useUnread } from '../communication/index.js';
import * as papi from '../api.js';
import './trip.css';

/**
 * TripInProgress (3C-3D) — Passenger Trip: In Progress.
 *
 * Reuses: BookingMap (live DriverMarker mode="inprogress" travels the route),
 * Avatar (driver), StatusIndicator (realtime trip-status notification),
 * useTripRealtime (TripProgress / TripCompleted), api.shareTrip / api.stopTrip.
 *
 * Display: Route, ETA, Distance Remaining, Driver Card, Trip Progress,
 * Share Trip, Stop Trip (operator only), Trip Status (realtime).
 *
 * Realtime: the screen runs a local simulation (no live GPS in the sample
 * backend) but the trip event channel is the source of truth for transitions —
 * TripProgress updates ETA/distance/progress, TripCompleted ends the trip.
 * Swapping in real telemetry needs no UI changes.
 */
export default function TripInProgress({ booking, driver, operator, onCall, onChat, onSafety, onCancel, onCompleted, onStopTrip }) {
  const totalKm = Number(booking?.distanceKm || driver?.distanceKm || 8.4);
  const totalMin = Math.max(1, Math.round((driver?.etaMin || 22)));

  const [etaMin, setEtaMin] = useState(totalMin);
  const [distKm, setDistKm] = useState(totalKm);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState('Perjalanan berlangsung');
  const [shareUrl, setShareUrl] = useState(null);
  const [completed, setCompleted] = useState(false);

  const event = useTripRealtime(booking?.id);
  const unread = useUnread(booking?.id);

  // Local simulation tick (realtime telemetry overrides below).
  useEffect(() => {
    if (completed) return undefined;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setEtaMin((m) => Math.max(0, +(m - 1 / 30).toFixed(2)));
      setProgress((p) => {
        const np = Math.min(100, p + 100 / (totalMin * 30));
        setDistKm(+(totalKm * (1 - np / 100)).toFixed(2));
        return np;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [completed, totalKm, totalMin]);

  // Realtime: backend telemetry (TripProgress) overrides local sim.
  useEffect(() => {
    if (event?.type === 'TripProgress') {
      const p = event.payload || {};
      if (typeof p.etaMin === 'number') setEtaMin(p.etaMin);
      if (typeof p.distanceKm === 'number') setDistKm(p.distanceKm);
      if (typeof p.progress === 'number') setProgress(p.progress);
      setStatus('Update rute diterima');
    }
    if (event?.type === 'TripCompleted') {
      setCompleted(true);
      setProgress(100);
      setEtaMin(0);
      setDistKm(0);
      setStatus('Perjalanan selesai');
      onCompleted?.(booking, event.payload);
    }
  }, [event, booking, onCompleted]);

  const share = async () => {
    try {
      const res = await papi.shareTrip(booking?.id);
      setShareUrl(res.url);
      setStatus('Tautan perjalanan disalin');
      try { await navigator.clipboard?.writeText(res.url); } catch { /* ignore */ }
    } catch {
      setStatus('Gagal membagikan perjalanan');
    }
  };

  const stop = async () => {
    try {
      await papi.stopTrip(booking?.id);
      setStatus('Perjalanan dihentikan oleh operator');
      onStopTrip?.(booking);
    } catch {
      setStatus('Gagal menghentikan perjalanan');
    }
  };

  const etaLabel = completed ? 'Tiba' : `${Math.max(0, Math.floor(etaMin))} mnt`;
  const distLabel = `${distKm.toFixed(2)} km`;
  const elapsedLabel = formatClock(elapsed);

  return (
    <div className="pasv-trip pasv-trip--inprogress">
      <header className="pasv-trip__bar">
        <span className="pasv-trip__status" role="status" aria-live="polite">
          <Icon icon={Navigation} size="xs" /> {completed ? 'Selesai' : 'Perjalanan berlangsung'}
        </span>
        <h1 className="pasv-trip__title">{completed ? 'Perjalanan Selesai' : 'Menuju Tujuan'}</h1>
      </header>

      {/* MAP — live driver marker traveling the route */}
      <BookingMap
        mode="inprogress"
        driver={driver}
        pickup={booking?.pickup}
        destination={booking?.destination}
        onCurrentLocation={() => {}}
        sheetOpen={false}
        height={300}
      />

      {/* TRIP STATUS (realtime notification) */}
      <div className="pasv-trip__statusbar" role="status" aria-live="polite">
        <StatusIndicator tone={completed ? 'success' : 'primary'} pulse={!completed} label={status} />
      </div>

      <main className="pasv-book__scroll pasv-inprogress">
        {/* Driver Card */}
        {driver && (
          <section className="pasv-assigned__card">
            <Avatar src={driver.photo} name={driver.name} size="lg" status="online" aria-label={`Foto driver ${driver.name}`} />
            <div className="pasv-assigned__info">
              <div className="pasv-assigned__name">{driver.name}</div>
              <div className="pasv-assigned__rating">
                <Icon icon={Car} size="xs" /> {driver.vehicle} · {driver.plate}
              </div>
            </div>
            <div className="pasv-inprogress__actions">
              <button type="button" className="pasv-ico-btn" aria-label={`Telepon ${driver.name}`} onClick={() => onCall?.(driver)}><Icon icon={Phone} size="sm" /></button>
              <button type="button" className="pasv-ico-btn pasv-ico-btn--chat" aria-label={`Chat ${driver.name}`} onClick={() => onChat?.(driver)}>
                <Icon icon={MessageCircle} size="sm" />
                {unread > 0 && <span className="pasv-badge" aria-label={`${unread} pesan belum dibaca`}>{unread > 9 ? '9+' : unread}</span>}
              </button>
              <button type="button" className="pasv-ico-btn pasv-ico-btn--safe" aria-label="Buka Pusat Keamanan" onClick={() => onSafety?.()}>
                <Icon icon={Shield} size="sm" />
              </button>
            </div>
          </section>
        )}

        {/* ETA + Distance Remaining + Elapsed */}
        <section className="pasv-arriving__stats" aria-live="polite">
          <div className="pasv-arriving__stat">
            <Icon icon={Clock} size="sm" />
            <span className="pasv-arriving__stat-val">{etaLabel}</span>
            <span className="pasv-arriving__stat-lbl">Estimasi tiba</span>
          </div>
          <div className="pasv-arriving__stat">
            <Icon icon={RouteIcon} size="sm" />
            <span className="pasv-arriving__stat-val">{distLabel}</span>
            <span className="pasv-arriving__stat-lbl">Jarak tersisa</span>
          </div>
          <div className="pasv-arriving__stat">
            <Icon icon={Navigation} size="sm" />
            <span className="pasv-arriving__stat-val">{elapsedLabel}</span>
            <span className="pasv-arriving__stat-lbl">Waktu tempuh</span>
          </div>
        </section>

        {/* Trip Progress */}
        <div className="pasv-arriving__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progres perjalanan">
          <span className="pasv-arriving__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="pasv-inprogress__proglbl">{Math.round(progress)}% perjalanan</p>

        {/* Actions */}
        <div className="pasv-inprogress__cta">
          <Button variant="secondary" onClick={share}>
            <Icon icon={Share2} size="sm" /> Bagikan Perjalanan
          </Button>
          {operator && (
            <Button variant="danger" onClick={stop}>
              <Icon icon={Square} size="sm" /> Stop Trip
            </Button>
          )}
        </div>
        {shareUrl && (
          <p className="pasv-inprogress__share" role="status">Tautan: <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></p>
        )}

        {/* Route summary */}
        <div className="pasv-wait__route">
          <div className="pasv-trip__leg"><Icon icon={MapPin} size="sm" /> <span>{booking?.pickup?.address || booking?.pickup?.title || 'Jemput'}</span></div>
          <div className="pasv-trip__line" />
          <div className="pasv-trip__leg"><Icon icon={Navigation} size="sm" /> <span>{booking?.destination?.address || booking?.destination?.title || 'Tujuan'}</span></div>
        </div>

        {!operator && (
          <button type="button" className="pasv-trip__cancel" onClick={() => onCancel?.(booking)}>Batalkan perjalanan</button>
        )}
      </main>
    </div>
  );
}

function formatClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
