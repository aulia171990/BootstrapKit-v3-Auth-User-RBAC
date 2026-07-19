import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Avatar, Badge } from '../../design-system/index.js';
import FareBreakdown from '../booking/FareBreakdown.jsx';
import { estimateFare, formatIDR } from '../booking/pricingEngine.js';
import {
  Download, Share2, RotateCcw, Receipt as ReceiptIcon, MapPin, Navigation, Car, Clock, Wallet, Tag, CheckCircle2, User,
} from 'lucide-react';
import * as papi from '../api.js';
import './completed.css';

// Map the summary vehicle label to a Pricing Engine key (keeps Payment Detail
// numbers identical to the engine used across the booking flow).
const VEHICLE_KEY = { Mobil: 'car', 'Motor XL': 'car-xl', Motor: 'motor', Sepeda: 'bike' };

/**
 * Receipt (3C-3H) — Trip Receipt. REUSES the Payment module:
 *   - FareBreakdown (3B-2E) renders the Payment Detail from the SAME Pricing
 *     Engine used in Vehicle Selection / Fare Review / Payment Selection.
 *   - estimateFare (pricingEngine) recomputes the fare lines from the trip's
 *     vehicle + route + promo so the receipt matches the invoice exactly.
 *
 * Implements: Invoice (no + date), Trip Summary, Payment Detail, Promo Detail,
 * Download Receipt, Share Receipt, Repeat Booking.
 *
 * Data is sample (no backend). Swapping in a real trip API needs no UI changes.
 */
export default function Receipt({ booking, driver, onHome, onRepeat, onDownload, onShare }) {
  const [summary, setSummary] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);

  useEffect(() => {
    papi.getTripSummary(booking?.id).then(setSummary);
  }, [booking?.id]);

  // Reuse the Pricing Engine to derive the Payment Detail lines.
  const fare = useMemo(() => {
    if (!summary) return null;
    const vehicleKey = VEHICLE_KEY[summary.vehicle] || 'car';
    return estimateFare(
      vehicleKey,
      { distanceKm: summary.distanceKm, durationMin: summary.durationMin },
      { promoDiscount: summary.promo?.amount || 0 },
    );
  }, [summary]);

  const download = () => {
    if (!summary) return;
    const lines = [
      'OJOL — Receipt Perjalanan',
      'No. Invoice: ' + summary.invoiceNo,
      'Tanggal: ' + new Date(summary.issuedAt).toLocaleString('id-ID'),
      'Driver: ' + (driver?.name || '—'),
      'Kendaraan: ' + (summary.vehicle || '—'),
      'Jarak: ' + summary.distanceKm + ' km',
      'Durasi: ' + summary.durationMin + ' mnt',
      'Pembayaran: ' + summary.paymentMethod + ' (' + (summary.paymentStatus === 'paid' ? 'Lunas' : 'Belum lunas') + ')',
      summary.promo ? 'Promo: ' + summary.promo.code + ' -' + formatIDR(summary.promo.amount) : null,
      'Total: ' + formatIDR(summary.fare),
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.invoiceNo}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onDownload?.(summary);
  };

  const share = async () => {
    try {
      const res = await papi.shareTrip(booking?.id);
      setShareUrl(res.url);
      try { await navigator.clipboard?.writeText(res.url); } catch { /* ignore */ }
      onShare?.(res.url);
    } catch { /* ignore */ }
  };

  const fmtDate = summary ? new Date(summary.issuedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="pasv-receipt">
      <header className="pasv-receipt__bar">
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={() => onHome?.()}><Icon icon={Navigation} size="sm" /></button>
        <h1 className="pasv-receipt__title">Receipt Perjalanan</h1>
      </header>

      <main className="pasv-book__scroll pasv-receipt__body">
        {/* Invoice */}
        <section className="pasv-receipt__invoice" aria-label="Invoice">
          <div className="pasv-receipt__invoice-ico"><Icon icon={ReceiptIcon} size="md" /></div>
          <div>
            <div className="pasv-receipt__invoice-no">{summary?.invoiceNo || '—'}</div>
            <div className="pasv-receipt__invoice-date">{fmtDate}</div>
          </div>
          <span className={`pasv-done__pay ${summary?.paymentStatus === 'paid' ? 'is-paid' : 'is-pending'}`}>
            <Icon icon={Wallet} size="xs" /> {summary?.paymentStatus === 'paid' ? 'Lunas' : 'Belum lunas'}
          </span>
        </section>

        {/* Trip Summary */}
        <section className="pasv-receipt__card" aria-label="Ringkasan perjalanan">
          <div className="pasv-receipt__card-head"><Icon icon={MapPin} size="sm" /> Trip Summary</div>
          {driver && (
            <div className="pasv-assigned__card" style={{ border: 'none', padding: 0 }}>
              <Avatar src={driver.photo} name={driver.name} size="md" aria-label={`Foto driver ${driver.name}`} />
              <div className="pasv-assigned__info">
                <div className="pasv-assigned__name">{driver.name}</div>
                <div className="pasv-assigned__rating"><Icon icon={Car} size="xs" /> {driver.vehicle} · {driver.plate}</div>
              </div>
            </div>
          )}
          <div className="pasv-receipt__grid">
            <div className="pasv-receipt__stat"><Icon icon={Car} size="sm" /><span>{summary?.vehicle || '—'}</span><span className="pasv-receipt__stat-lbl">Kendaraan</span></div>
            <div className="pasv-receipt__stat"><Icon icon={Navigation} size="sm" /><span>{summary ? `${summary.distanceKm} km` : '—'}</span><span className="pasv-receipt__stat-lbl">Jarak</span></div>
            <div className="pasv-receipt__stat"><Icon icon={Clock} size="sm" /><span>{summary ? `${summary.durationMin} mnt` : '—'}</span><span className="pasv-receipt__stat-lbl">Durasi</span></div>
          </div>
        </section>

        {/* Promo Detail */}
        {summary?.promo && (
          <section className="pasv-receipt__card" aria-label="Detail promo">
            <div className="pasv-receipt__card-head"><Icon icon={Tag} size="sm" /> Promo Detail</div>
            <div className="pasv-receipt__promo">
              <span className="pasv-receipt__promo-title">{summary.promo.title}</span>
              <Badge tone={summary.promo.tone || 'success'}>{summary.promo.code}</Badge>
              <span className="pasv-receipt__promo-amt">-{formatIDR(summary.promo.amount)}</span>
            </div>
          </section>
        )}

        {/* Payment Detail (reuses Payment module FareBreakdown + Pricing Engine) */}
        <section className="pasv-receipt__card" aria-label="Detail pembayaran">
          <div className="pasv-receipt__card-head"><Icon icon={Wallet} size="sm" /> Payment Detail</div>
          {fare ? (
            <FareBreakdown fare={fare} title="" />
          ) : (
            <p className="pasv-receipt__loading">Memuat rincian pembayaran…</p>
          )}
        </section>

        {/* Actions */}
        <div className="pasv-receipt__actions">
          <Button variant="secondary" onClick={download}><Icon icon={Download} size="sm" /> Download</Button>
          <Button variant="secondary" onClick={share}><Icon icon={Share2} size="sm" /> Share</Button>
        </div>
        {shareUrl && <p className="pasv-inprogress__share" role="status">Tautan: <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></p>}

        <Button variant="primary" className="pasv-receipt__repeat" onClick={() => onRepeat?.(booking, driver)}>
          <Icon icon={RotateCcw} size="sm" /> Pesan Lagi (Repeat Booking)
        </Button>
        <button type="button" className="pasv-trip__cancel" onClick={() => onHome?.()}>Kembali ke Beranda</button>
      </main>
    </div>
  );
}
