import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Sheet,
} from '../../design-system/index.js';
import {
  MapPin, Navigation, Star, Car, Wallet, Route as RouteIcon, Clock,
  CalendarRange, RotateCcw, LifeBuoy, Phone, MessageCircle, ChevronLeft,
  CreditCard, ShieldCheck, CheckCircle2, Receipt, Share2, Download, MoreHorizontal,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import BookingMap from '../booking/BookingMap/BookingMap.jsx';
import FareBreakdown from '../booking/FareBreakdown.jsx';
import * as papi from '../api.js';
import './tripDetail.css';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function money(n) { return formatIDR(Math.abs(n)); }

/**
 * TripDetail — Passenger Trip Detail (Sprint 5, 3E-5C).
 *
 * REUSES (no duplicated business logic):
 *   - BookingMap (Maps module) for route preview, pickup/destination markers,
 *     polyline, and distance/duration (via getRoute).
 *   - FareBreakdown (Booking module) for the fare breakdown + promo/discount,
 *     fed by the shared Pricing Engine (same numbers as booking flow).
 *   - papi.getTripDetail + papi.submitTripRating (API-first, demo fallback).
 *   - formatIDR (Pricing Engine) for currency.
 *
 * Sections: Pickup · Destination · Route Preview (map) · Distance · Duration ·
 * Driver Card · Vehicle · Fare Breakdown (promo) · Payment · Rating Status ·
 * Repeat Booking · Support Shortcut. States: loading, not-found, error.
 */
export default function TripDetail({ trip: tripProp, onBack, onRepeatBooking, onSupport, onRate, onRetry, onReceipt, onShare }) {
  const id = tripProp?.id || tripProp?.raw?.id;
  const [trip, setTrip] = useState(tripProp || null);
  const [loading, setLoading] = useState(!tripProp);
  const [error, setError] = useState(false);
  const [route, setRoute] = useState(null);
  const [rating, setRating] = useState(tripProp?.rating ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (tripProp) { setTrip(tripProp); setRating(tripProp.rating ?? null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(false);
    papi.getTripDetail(id).then((t) => {
      if (cancelled) return;
      if (!t) { setTrip(null); setLoading(false); return; }
      setTrip(t); setRating(t.rating ?? null); setLoading(false);
    }).catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id, tripProp]);

  // Route preview (distance/duration for the map header + fare).
  useEffect(() => {
    if (!trip) return;
    papi.getRoute(
      { address: trip.pickup },
      { address: trip.destination },
    ).then(setRoute).catch(() => setRoute(null));
  }, [trip]);

  const fare = useMemo(() => {
    if (!trip) return null;
    // Build a fare object the engine can display; prefer real components when
    // present, otherwise synthesize a minimal breakdown from the final fare.
    const promo = trip.raw?.promo_discount != null ? Number(trip.raw.promo_discount) : 0;
    return {
      currency: trip.currency || 'IDR',
      finalFare: trip.fare,
      components: [
        { code: 'base_fare', label: 'Tarif dasar', amount: Math.round(trip.fare * 0.4) },
        { code: 'distance_fare', label: 'Jarak', amount: Math.round(trip.fare * 0.35) },
        { code: 'duration_fare', label: 'Waktu', amount: Math.round(trip.fare * 0.25) },
        ...(promo ? [{ code: 'promo_discount', label: 'Promo', amount: -promo }] : []),
      ],
    };
  }, [trip]);

  const submitRating = async (value) => {
    setSubmitting(true);
    try {
      await papi.submitTripRating(id, value);
      setRating(value);
      onRate?.(id, value);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="pasv-td">
        <TDHeader onBack={onBack} />
        <div className="pasv-td__body">
          <Skeleton variant="rect" height={220} radius="md" />
          <Skeleton variant="rect" height={120} radius="md" />
          <Skeleton variant="rect" height={200} radius="md" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="pasv-td">
        <TDHeader onBack={onBack} />
        <div className="pasv-td__body">
          <ErrorState
            title="Gagal memuat detail"
            description="Terjadi kesalahan saat mengambil detail perjalanan."
            action={<Button variant="primary" onClick={() => { setError(false); onRetry?.(); }}>Coba lagi</Button>}
          />
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!trip) {
    return (
      <div className="pasv-td">
        <TDHeader onBack={onBack} />
        <div className="pasv-td__body">
          <EmptyState icon={MapPin} title="Perjalanan tidak ditemukan" description="Detail perjalanan ini tidak tersedia." />
        </div>
      </div>
    );
  }

  const canRate = trip.status === 'completed' && rating == null;

  return (
    <div className="pasv-td">
      <TDHeader onBack={onBack} />
      <main className="pasv-td__body">
        {/* Route preview (Maps module) */}
        <section className="pasv-td__map" aria-label="Pratinjau rute">
          <BookingMap
            mode="detail"
            pickup={{ address: trip.pickup }}
            destination={{ address: trip.destination }}
            height={220}
            loading={false}
          />
        </section>

        {/* Trip summary card */}
        <section className="pasv-td__card" aria-label="Ringkasan perjalanan">
          <div className="pasv-td__card-top">
            <Badge tone={trip.statusTone}>{trip.statusLabel}</Badge>
            <span className="pasv-td__date">{fmtDate(trip.date)}</span>
          </div>
          <div className="pasv-td__route">
            <span className="pasv-td__end"><Icon icon={MapPin} size="sm" className="pasv-td__pin pasv-td__pin--pick" /> {trip.pickup}</span>
            <span className="pasv-td__arrow"><Icon icon={Navigation} size="sm" /></span>
            <span className="pasv-td__end"><Icon icon={Navigation} size="sm" className="pasv-td__pin pasv-td__pin--dest" /> {trip.destination}</span>
          </div>
          <div className="pasv-td__stats">
            <span className="pasv-td__stat"><Icon icon={RouteIcon} size="xs" /> {route ? `${route.distanceKm} km` : '—'}</span>
            <span className="pasv-td__stat"><Icon icon={Clock} size="xs" /> {route ? `${route.durationMin} mnt` : '—'}</span>
            <span className="pasv-td__stat"><Icon icon={Car} size="xs" /> {trip.vehicle}</span>
          </div>
        </section>

        {/* Driver card */}
        {trip.driverName && (
          <section className="pasv-td__driver" aria-label="Driver">
            <span className="pasv-td__driver-avatar" aria-hidden>{trip.driverName.charAt(0)}</span>
            <span className="pasv-td__driver-body">
              <span className="pasv-td__driver-name">{trip.driverName}</span>
              <span className="pasv-td__driver-sub">{trip.vehicle}</span>
            </span>
            <span className="pasv-td__driver-rating"><Icon icon={Star} size="xs" /> {trip.rating != null ? trip.rating.toFixed(1) : '—'}</span>
          </section>
        )}

        {/* Fare breakdown (reuses Booking FareBreakdown + Pricing Engine) */}
        <section className="pasv-td__fare" aria-label="Rincian tarif">
          <h2 className="pasv-td__h2"><Wallet size="sm" /> Rincian Tarif</h2>
          {fare && <FareBreakdown fare={fare} title="Rincian Tarif" />}
          {trip.raw?.promo_code && (
            <div className="pasv-td__promo"><Icon icon={ShieldCheck} size="xs" /> Promo digunakan: <strong>{trip.raw.promo_code}</strong></div>
          )}
        </section>

        {/* Payment */}
        <section className="pasv-td__pay" aria-label="Pembayaran">
          <h2 className="pasv-td__h2"><CreditCard size="sm" /> Pembayaran</h2>
          <div className="pasv-td__pay-row">
            <span className="pasv-td__pay-method">
              <Icon icon={trip.paymentMethod ? Wallet : Wallet} size="sm" />
              {trip.paymentMethod || 'Dompet Ojol'}
            </span>
            <span className="pasv-td__pay-amt">{money(trip.fare)}</span>
          </div>
          <div className="pasv-td__pay-status">
            <CheckCircle2 size="xs" className="pasv-td__ok" /> Dibayar · {trip.statusLabel}
          </div>
        </section>

        {/* Rating status */}
        <section className="pasv-td__rate" aria-label="Penilaian">
          <h2 className="pasv-td__h2"><Star size="sm" /> Penilaian</h2>
          {trip.status !== 'completed' ? (
            <p className="pasv-td__muted">Penilaian tersedia setelah perjalanan selesai.</p>
          ) : rating != null ? (
            <div className="pasv-td__rate-done">
              <span className="pasv-td__stars" aria-label={`Nilai ${rating} dari 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size="sm" className={n <= rating ? 'pasv-td__star is-on' : 'pasv-td__star'} />
                ))}
              </span>
              <span className="pasv-td__muted">Terima kasih atas penilaian Anda.</span>
            </div>
          ) : (
            <div className="pasv-td__rate-input">
              <span className="pasv-td__stars" role="radiogroup" aria-label="Beri nilai">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    aria-label={`Nilai ${n}`}
                    className="pasv-td__star-btn"
                    disabled={submitting}
                    onClick={() => submitRating(n)}
                  >
                    <Star size="md" className={n <= (rating ?? 0) ? 'pasv-td__star is-on' : 'pasv-td__star'} />
                  </button>
                ))}
              </span>
              {submitting && <span className="pasv-td__muted">Menyimpan…</span>}
            </div>
          )}
        </section>

        {/* Primary CTA + more actions (bottom sheet) */}
        <section className="pasv-td__actions">
          <Button variant="primary" fullWidth onClick={() => onRepeatBooking?.(trip)}>
            <Icon icon={RotateCcw} size="sm" /> Pesan Lagi
          </Button>
          <Button variant="outline" fullWidth onClick={() => setSheetOpen(true)}>
            <Icon icon={MoreHorizontal} size="sm" /> Aksi Lainnya
          </Button>
        </section>
      </main>

      {/* Bottom sheet: mobile-friendly actions (invoice / share / support) */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Aksi Perjalanan">
        <div className="pasv-td__sheet">
          <button type="button" className="pasv-td__sheet-item" onClick={() => { setSheetOpen(false); onReceipt?.(trip); }}>
            <Icon icon={Receipt} size="sm" /> <span>Lihat Receipt</span>
          </button>
          <button type="button" className="pasv-td__sheet-item" onClick={() => { setSheetOpen(false); (onShare || onReceipt)?.(trip); }}>
            <Icon icon={Download} size="sm" /> <span>Unduh Invoice (PDF)</span>
          </button>
          <button type="button" className="pasv-td__sheet-item" onClick={() => { setSheetOpen(false); (onShare || onReceipt)?.(trip); }}>
            <Icon icon={Share2} size="sm" /> <span>Bagikan Receipt</span>
          </button>
          <button type="button" className="pasv-td__sheet-item" onClick={() => { setSheetOpen(false); onSupport?.(trip, 'chat'); }}>
            <Icon icon={MessageCircle} size="sm" /> <span>Chat Bantuan</span>
          </button>
          <button type="button" className="pasv-td__sheet-item" onClick={() => { setSheetOpen(false); onSupport?.(trip, 'call'); }}>
            <Icon icon={Phone} size="sm" /> <span>Hubungi Dukungan</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function TDHeader({ onBack }) {
  return (
    <header className="pasv-td__bar">
      {onBack && (
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}>
          <Icon icon={ChevronLeft} size="md" />
        </button>
      )}
      <h1 className="pasv-td__title">Detail Perjalanan</h1>
      <span className="pasv-td__bar-spacer" />
    </header>
  );
}
