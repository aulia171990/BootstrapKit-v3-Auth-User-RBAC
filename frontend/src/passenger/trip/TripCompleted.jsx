import React, { useEffect, useState } from 'react';
import { Button, Icon, Avatar } from '../../design-system/index.js';
import { CheckCircle2, Receipt as ReceiptIcon, Star, Car, Route as RouteIcon, Clock, Wallet, ArrowRight } from 'lucide-react';
import * as papi from '../api.js';
import './completed.css';

/**
 * TripCompleted (3C-3G) — Passenger Trip: Completed.
 *
 * Reuses: Avatar (driver), Button, Icon, api.getTripSummary (sample). Shows a
 * success animation, trip summary (fare, distance, duration, payment status),
 * Rate Driver, and a Receipt button that navigates to the receipt (3H).
 *
 * Data is sample (no backend). Swapping in a real trip API needs no UI changes.
 */
export default function TripCompleted({ booking, driver, onReceipt, onRate, onHome }) {
  const [summary, setSummary] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    papi.getTripSummary(booking?.id).then(setSummary);
  }, [booking?.id]);

  const submitRating = (value) => {
    setRating(value);
    setRated(true);
    onRate?.(booking, driver, value);
  };

  const fmt = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const fare = summary?.fare ?? 0;
  const paid = summary?.paymentStatus === 'paid';

  return (
    <div className="pasv-done">
      {/* Success animation */}
      <div className="pasv-done__anim" role="img" aria-label="Perjalanan selesai">
        <CheckCircle2 size={84} strokeWidth={1.6} className="pasv-done__check" />
      </div>
      <h1 className="pasv-done__title">Perjalanan Selesai</h1>
      <p className="pasv-done__sub">Terima kasih telah menggunakan layanan kami.</p>

      <main className="pasv-book__scroll pasv-done__body">
        {/* Summary */}
        <section className="pasv-done__summary" aria-live="polite">
          <div className="pasv-done__fare">
            <span className="pasv-done__fare-lbl">Total Bayar</span>
            <span className="pasv-done__fare-val">{fmt(fare)}</span>
            <span className={`pasv-done__pay ${paid ? 'is-paid' : 'is-pending'}`}>
              <Icon icon={Wallet} size="xs" /> {paid ? 'Lunas' : 'Belum lunas'}
            </span>
          </div>
          <div className="pasv-done__stats">
            <div className="pasv-done__stat">
              <Icon icon={RouteIcon} size="sm" />
              <span>{summary ? `${summary.distanceKm} km` : '—'}</span>
              <span className="pasv-done__stat-lbl">Jarak</span>
            </div>
            <div className="pasv-done__stat">
              <Icon icon={Clock} size="sm" />
              <span>{summary ? `${summary.durationMin} mnt` : '—'}</span>
              <span className="pasv-done__stat-lbl">Durasi</span>
            </div>
            <div className="pasv-done__stat">
              <Icon icon={Car} size="sm" />
              <span>{summary?.vehicle || '—'}</span>
              <span className="pasv-done__stat-lbl">Kendaraan</span>
            </div>
          </div>
        </section>

        {/* Driver + Rate */}
        {driver && (
          <section className="pasv-assigned__card">
            <Avatar src={driver.photo} name={driver.name} size="lg" status="offline" aria-label={`Foto driver ${driver.name}`} />
            <div className="pasv-assigned__info">
              <div className="pasv-assigned__name">{driver.name}</div>
              <div className="pasv-assigned__rating">
                <Icon icon={Car} size="xs" /> {driver.vehicle} · {driver.plate}
              </div>
            </div>
          </section>
        )}

        <section className="pasv-done__rate" aria-label="Nilai driver">
          <span className="pasv-done__rate-lbl">{rated ? 'Penilaian Anda' : 'Nilai driver Anda'}</span>
          <div className="pasv-done__stars" role="radiogroup" aria-label="Rating driver">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                className={`pasv-done__star ${v <= (hover || rating) ? 'is-on' : ''}`}
                aria-label={`${v} bintang`}
                aria-checked={rating === v}
                role="radio"
                disabled={rated}
                onMouseEnter={() => setHover(v)}
                onMouseLeave={() => setHover(0)}
                onClick={() => submitRating(v)}
              >
                <Icon icon={Star} size="md" />
              </button>
            ))}
          </div>
          {rated && <p className="pasv-done__rate-ok" role="status"><Icon icon={CheckCircle2} size="xs" /> Terima kasih atas penilaiannya!</p>}
        </section>

        {/* Actions */}
        <div className="pasv-done__cta">
          <Button variant="primary" className="pasv-done__receipt" onClick={() => onReceipt?.(booking, driver)}>
            <Icon icon={ReceiptIcon} size="sm" /> Lihat Receipt
            <Icon icon={ArrowRight} size="xs" />
          </Button>
        </div>
        <button type="button" className="pasv-trip__cancel" onClick={() => onHome?.()}>Kembali ke Beranda</button>
      </main>
    </div>
  );
}
