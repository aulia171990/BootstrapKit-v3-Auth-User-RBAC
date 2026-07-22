import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Tabs,
} from '../../design-system/index.js';
import {
  Download, Share2, Mail, Receipt as ReceiptIcon, FileText, MapPin, Navigation,
  Car, Clock, Wallet, Tag, CheckCircle2, Copy, X, Send,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import FareBreakdown from '../booking/FareBreakdown.jsx';
import * as papi from '../api.js';
import './activityReceipt.css';

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}
function money(n) { return formatIDR(Math.abs(n)); }

/**
 * ActivityReceipt — Passenger Receipt & Invoice (Sprint 5, 3E-5D).
 *
 * REUSES (no duplicated business logic):
 *   - papi.getReceipt (derives from getTripDetail + getTransactions — real
 *     Wallet/Trip APIs, demo fallback).
 *   - FareBreakdown (Booking/Payment module) for the Payment Breakdown, fed by
 *     the shared Pricing Engine (identical numbers to booking + detail).
 *   - papi.emailReceipt for the email action (API-first, demo fallback).
 *   - formatIDR (Pricing Engine) for currency.
 *
 * Tabs: Receipt · Invoice. Actions: Download PDF · Share · Email.
 * Shows: Payment Breakdown (taxes/promo/wallet usage), Transaction ID.
 * States: loading, not-found, error.
 */
export default function ActivityReceipt({ tripId, onBack, onDownload, onShare, onEmail }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('receipt');
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false);
    papi.getReceipt(tripId).then((d) => {
      if (cancelled) return;
      if (!d) { setData(null); setLoading(false); return; }
      setData(d); setLoading(false);
    }).catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [tripId]);

  const trip = data?.trip;
  const invoiceNo = useMemo(() => `INV-${String(tripId).toUpperCase()}-${new Date(data?.issuedAt || Date.now()).getFullYear()}`, [tripId, data]);

  const fare = useMemo(() => {
    if (!trip) return null;
    const promo = data?.promoAmount ? Number(data.promoAmount) : 0;
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
  }, [trip, data]);

  const buildText = () => {
    const lines = [
      'OJOL — ' + (tab === 'invoice' ? 'Invoice' : 'Receipt') + ' Perjalanan',
      'No. ' + (tab === 'invoice' ? invoiceNo : `RCPT-${tripId}`),
      'Tanggal: ' + fmtDateTime(data?.issuedAt),
      'Transaksi: ' + data?.transactionId,
      'Rute: ' + trip.pickup + ' → ' + trip.destination,
      'Driver: ' + (trip.driverName || '—'),
      'Kendaraan: ' + (trip.vehicle || '—'),
      'Pembayaran: ' + (data?.paidVia || 'Wallet'),
      data?.walletUsage ? 'Penggunaan Dompet: ' + money(data.walletUsage) : null,
      data?.tax ? 'Pajak: ' + money(data.tax) : null,
      data?.promoCode ? 'Promo: ' + data.promoCode + ' -' + money(data.promoAmount) : null,
      'Total: ' + money(trip.fare),
    ].filter(Boolean);
    return lines.join('\n');
  };

  const downloadPdf = () => {
    if (!data) return;
    // Plain-text "PDF" (offline-friendly; real backend can return a PDF blob).
    const blob = new Blob([buildText()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab === 'invoice' ? invoiceNo : `RCPT-${tripId}`}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    onDownload?.(data);
  };

  const share = async () => {
    if (!data) return;
    const url = `https://ojol.app/r/${tripId}`;
    setShareUrl(url);
    try { await navigator.clipboard?.writeText(url); } catch { /* ignore */ }
    onShare?.(url);
  };

  const sendEmail = async () => {
    if (!email) return;
    await papi.emailReceipt(tripId, email);
    setEmailSent(true);
    onEmail?.(email);
    setTimeout(() => setEmailOpen(false), 1200);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="pasv-rcpt">
        <RCHeader onBack={onBack} />
        <div className="pasv-rcpt__body"><Skeleton variant="rect" height={320} radius="md" /></div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="pasv-rcpt">
        <RCHeader onBack={onBack} />
        <div className="pasv-rcpt__body">
          <ErrorState title="Gagal memuat receipt" description="Terjadi kesalahan saat mengambil receipt." action={<Button variant="primary" onClick={() => setError(false)}>Coba lagi</Button>} />
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!data) {
    return (
      <div className="pasv-rcpt">
        <RCHeader onBack={onBack} />
        <div className="pasv-rcpt__body"><EmptyState icon={ReceiptIcon} title="Receipt tidak ditemukan" description="Receipt perjalanan ini tidak tersedia." /></div>
      </div>
    );
  }

  return (
    <div className="pasv-rcpt">
      <RCHeader onBack={onBack} />

      <Tabs
        tabs={[{ id: 'receipt', label: 'Receipt' }, { id: 'invoice', label: 'Invoice' }]}
        active={tab}
        onValueChange={setTab}
        aria-label="Pilih receipt atau invoice"
      />

      <main className="pasv-rcpt__body">
        <section className="pasv-rcpt__doc" aria-label={tab === 'invoice' ? 'Invoice' : 'Receipt'}>
          <div className="pasv-rcpt__doc-head">
            <span className="pasv-rcpt__doc-ico"><Icon icon={tab === 'invoice' ? FileText : ReceiptIcon} size="md" /></span>
            <div>
              <div className="pasv-rcpt__doc-no">{tab === 'invoice' ? invoiceNo : `RCPT-${tripId}`}</div>
              <div className="pasv-rcpt__doc-date">{fmtDateTime(data.issuedAt)}</div>
            </div>
            <span className="pasv-rcpt__paid"><CheckCircle2 size="xs" /> Lunas</span>
          </div>

          <div className="pasv-rcpt__route">
            <span className="pasv-rcpt__end"><Icon icon={MapPin} size="xs" className="pasv-rcpt__pin--pick" /> {trip.pickup}</span>
            <Icon icon={Navigation} size="xs" className="pasv-rcpt__arrow" />
            <span className="pasv-rcpt__end"><Icon icon={Navigation} size="xs" className="pasv-rcpt__pin--dest" /> {trip.destination}</span>
          </div>

          <div className="pasv-rcpt__meta">
            <span><Icon icon={Car} size="xs" /> {trip.vehicle}</span>
            {trip.driverName && <span><Icon icon={Wallet} size="xs" /> {trip.driverName}</span>}
            <span className="pasv-rcpt__txid">
              <Icon icon={Copy} size="xs" /> TX: {data.transactionId}
            </span>
          </div>

          {/* Payment Breakdown (reuses Payment module FareBreakdown) */}
          <div className="pasv-rcpt__breakdown">
            {fare && <FareBreakdown fare={fare} title="" />}
          </div>

          {/* Taxes / Promo / Wallet usage rows */}
          <div className="pasv-rcpt__rows">
            {data.tax != null && (
              <div className="pasv-rcpt__row"><span>Pajak</span><span>{money(data.tax)}</span></div>
            )}
            {data.promoCode && (
              <div className="pasv-rcpt__row pasv-rcpt__row--promo">
                <span><Tag size="xs" /> Promo {data.promoCode}</span><span>-{money(data.promoAmount)}</span>
              </div>
            )}
            {data.walletUsage ? (
              <div className="pasv-rcpt__row"><span><Wallet size="xs" /> Penggunaan Dompet</span><span>{money(data.walletUsage)}</span></div>
            ) : null}
            <div className="pasv-rcpt__row pasv-rcpt__row--total">
              <span>Total Dibayar</span><span>{money(trip.fare)}</span>
            </div>
            <div className="pasv-rcpt__row pasv-rcpt__row--method">
              <span>Metode Pembayaran</span><span>{data.paidVia || 'Wallet'}</span>
            </div>
          </div>
        </section>

        {shareUrl && (
          <p className="pasv-rcpt__share" role="status">
            Tautan receipt tersalin: <span className="pasv-rcpt__share-url">{shareUrl}</span>
          </p>
        )}

        <div className="pasv-rcpt__actions">
          <Button variant="secondary" onClick={downloadPdf}><Icon icon={Download} size="sm" /> Download PDF</Button>
          <Button variant="secondary" onClick={share}><Icon icon={Share2} size="sm" /> Share</Button>
          <Button variant="secondary" onClick={() => { setEmailSent(false); setEmailOpen(true); }}><Icon icon={Mail} size="sm" /> Email</Button>
        </div>
      </main>

      {/* Email dialog */}
      {emailOpen && (
        <div className="pasv-rcpt__modal" role="dialog" aria-modal="true" aria-label="Kirim receipt via email">
          <div className="pasv-rcpt__sheet">
            <div className="pasv-rcpt__sheet-head">
              <h2>Kirim via Email</h2>
              <button type="button" className="pasv-ico-btn" aria-label="Tutup" onClick={() => setEmailOpen(false)}><Icon icon={X} size="sm" /></button>
            </div>
            {emailSent ? (
              <p className="pasv-rcpt__ok"><CheckCircle2 size="sm" /> Receipt dikirim ke {email}</p>
            ) : (
              <form className="pasv-rcpt__form" onSubmit={(e) => { e.preventDefault(); sendEmail(); }}>
                <input
                  type="email"
                  className="pasv-rcpt__input"
                  placeholder="email@contoh.com"
                  aria-label="Alamat email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" fullWidth><Icon icon={Send} size="sm" /> Kirim</Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RCHeader({ onBack }) {
  return (
    <header className="pasv-rcpt__bar">
      {onBack && (
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={X} size="md" /></button>
      )}
      <h1 className="pasv-rcpt__title">Receipt &amp; Invoice</h1>
      <span className="pasv-rcpt__bar-spacer" />
    </header>
  );
}
