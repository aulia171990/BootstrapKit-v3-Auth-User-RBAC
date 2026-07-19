import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Radio, Badge } from '../../design-system/index.js';
import {
  ChevronLeft, Tag, Ticket, Wallet, Banknote, CreditCard, Star, Check,
  Receipt, Info,
} from 'lucide-react';
import * as papi from '../api.js';
import { estimateFare, formatIDR } from './pricingEngine.js';
import './booking.css';

/**
 * PaymentSelection (3B-2F) — promo/voucher selection, payment method, and
 * fare summary. REUSES the Passenger data layer (Promotion + Wallet) and the
 * shared Pricing Engine.
 *
 *  - Promo Selection: lists available promos/vouchers from `getPromotions()`;
 *    selecting one applies its discount to the fare via the engine.
 *  - Voucher: entering a code applies a matching promo (falls back to a manual
 *    discount if the code is unknown, so the UI flow is demonstrable).
 *  - Payment Method: Wallet (balance-aware), Cash, Credit Card, Saved Cards.
 *  - Fare Summary: recomputed by the SAME engine used in 3B-2C/2D/2E so the
 *    numbers stay consistent.
 *
 * Display/selection only — no booking is created. This is the phase stop point.
 */

// Discount value per promo code (sample; mirrors getPromotions codes).
const PROMO_DISCOUNT = { HALO50: 5000, JALAN15: 15000, CASH20: 8000 };

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Dompet Ojol', icon: Wallet, needsBalance: true },
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'card', label: 'Kartu Kredit', icon: CreditCard },
  { id: 'saved', label: 'Kartu Tersimpan', icon: Star },
];

export default function PaymentSelection({
  vehicle, route, surge, fare, user, onBack, onConfirm,
}) {
  const [promos, setPromos] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState(null); // promo object
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null); // {code, amount} | {code, error}
  const [method, setMethod] = useState('wallet');

  useEffect(() => {
    let cancelled = false;
    Promise.all([papi.getPromotions(), papi.getWallet()])
      .then(([p, w]) => { if (!cancelled) { setPromos(p); setWallet(w); } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Resolve the active discount (promo OR voucher).
  const discount = useMemo(() => {
    if (selectedPromo) return PROMO_DISCOUNT[selectedPromo.code] || 0;
    if (voucherApplied && !voucherApplied.error) return voucherApplied.amount;
    return 0;
  }, [selectedPromo, voucherApplied]);

  // Recompute the fare with the active discount via the SHARED engine.
  const summary = useMemo(() => {
    if (!vehicle || !route) return fare || null;
    return estimateFare(vehicle, { distanceKm: route.distanceKm, durationMin: route.durationMin }, {
      surgeMultiplier: surge?.multiplier,
      promoDiscount: discount,
    });
  }, [vehicle, route, surge, discount, fare]);

  const walletOk = method !== 'wallet' || (wallet && wallet.balance >= (summary?.finalFare || 0));

  const applyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;
    const known = PROMO_DISCOUNT[code];
    if (known) setVoucherApplied({ code, amount: known });
    else setVoucherApplied({ code, amount: 0, error: 'Kode voucher tidak ditemukan' });
  };

  if (loading) {
    return (
      <div className="pasv-book">
        <Bar onBack={onBack} title="Pembayaran" />
        <div className="pasv-book__scroll"><div className="pasv-pay__loading">Memuat promo & dompet…</div></div>
      </div>
    );
  }

  return (
    <div className="pasv-book">
      <Bar onBack={onBack} title="Pembayaran" />

      <div className="pasv-book__scroll">
        {/* ---- Promo Selection ---- */}
        <section className="pasv-pay__section">
          <h2 className="pasv-book__section-title">Promo &amp; Voucher</h2>
          <ul className="pasv-pay__promos" role="radiogroup" aria-label="Pilih promo">
            {promos.map((p) => {
              const active = selectedPromo?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`pasv-pay__promo ${active ? 'pasv-pay__promo--active' : ''}`}
                    role="radio" aria-checked={active}
                    onClick={() => { setSelectedPromo(active ? null : p); setVoucherCode(''); setVoucherApplied(null); }}
                  >
                    <span className="pasv-pay__promo-ico" data-tone={p.tone}><Icon icon={p.kind === 'voucher' ? Ticket : Tag} size="sm" /></span>
                    <span className="pasv-pay__promo-body">
                      <span className="pasv-pay__promo-title">{p.title}</span>
                      <span className="pasv-pay__promo-sub">{p.subtitle}</span>
                      <Badge tone={p.tone}>{p.code}</Badge>
                    </span>
                    {active && <Icon icon={Check} size="sm" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ---- Voucher entry ---- */}
          <div className="pasv-pay__voucher">
            <input
              className="pasv-pay__voucher-input"
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={(e) => { setVoucherCode(e.target.value); setVoucherApplied(null); }}
              aria-label="Kode voucher"
            />
            <Button variant="outline" onClick={applyVoucher} disabled={!voucherCode.trim()}>Pakai</Button>
          </div>
          {voucherApplied && voucherApplied.error ? (
            <p className="pasv-pay__voucher-msg pasv-pay__voucher-msg--err">{voucherApplied.error}</p>
          ) : voucherApplied ? (
            <p className="pasv-pay__voucher-msg pasv-pay__voucher-msg--ok">Voucher {voucherApplied.code} aktif · {formatIDR(voucherApplied.amount)}</p>
          ) : null}
        </section>

        {/* ---- Payment Method ---- */}
        <section className="pasv-pay__section">
          <h2 className="pasv-book__section-title">Metode Pembayaran</h2>
          <div className="pasv-pay__methods" role="radiogroup" aria-label="Metode pembayaran">
            {PAYMENT_METHODS.map((m) => {
              const Ico = m.icon;
              const active = method === m.id;
              const disabled = m.needsBalance && wallet && wallet.balance < (summary?.finalFare || 0);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`pasv-pay__method ${active ? 'pasv-pay__method--active' : ''}`}
                  role="radio" aria-checked={active} aria-disabled={disabled}
                  disabled={disabled}
                  onClick={() => setMethod(m.id)}
                >
                  <span className="pasv-pay__method-ico"><Icon icon={Ico} size="sm" /></span>
                  <span className="pasv-pay__method-body">
                    <span className="pasv-pay__method-label">{m.label}</span>
                    {m.id === 'wallet' && wallet && (
                      <span className="pasv-pay__method-sub">Saldo {formatIDR(wallet.balance, wallet.currency)}</span>
                    )}
                    {m.id === 'saved' && <span className="pasv-pay__method-sub">•••• 4921 · Budi A.</span>}
                  </span>
                  <Radio checked={active} readOnly />
                </button>
              );
            })}
          </div>
          {!walletOk && (
            <p className="pasv-pay__warn"><Icon icon={Info} size="xs" /> Saldo dompet tidak cukup untuk perjalanan ini.</p>
          )}
        </section>

        {/* ---- Fare Summary (reuses Pricing Engine) ---- */}
        <section className="pasv-pay__section">
          <h2 className="pasv-book__section-title">Ringkasan Tarif</h2>
          <FareSummary summary={summary} currency={summary?.currency || 'IDR'} />
        </section>

        <Button
          variant="primary"
          className="pasv-book__confirm-btn"
          disabled={!walletOk}
          onClick={() => onConfirm?.({ method, promo: selectedPromo, voucher: voucherApplied, fare: summary })}
        >
          {walletOk ? 'Lanjutkan Pembayaran' : 'Saldo tidak cukup'}
        </Button>
      </div>
    </div>
  );
}

function FareSummary({ summary, currency }) {
  const components = summary?.components || [];
  const line = (code) => components.find((c) => c.code === code);
  const rows = [
    { label: 'Tarif dasar', c: line('base_fare') },
    { label: 'Jarak', c: line('distance_fare') },
    { label: 'Waktu', c: line('duration_fare') },
    { label: 'Surge', c: line('surge') },
    { label: 'Diskon', c: line('promo_discount') },
    { label: 'Pajak', c: line('tax') },
  ];
  return (
    <div className="pasv-pay__summary">
      <ul className="pasv-pay__summary-list">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="pasv-fare__label">{r.label}</span>
            <span className={`pasv-fare__amount ${(r.c?.amount || 0) < 0 ? 'pasv-fare__neg' : ''}`}>
              {r.c ? formatIDR(r.c.amount, currency) : '—'}
            </span>
          </li>
        )).filter((_, i) => rows[i].c)}
      </ul>
      <div className="pasv-fare__total">
        <span>Total dibayar</span>
        <span className="pasv-fare__total-amount">{formatIDR(summary?.finalFare, currency)}</span>
      </div>
    </div>
  );
}

function Bar({ onBack, title }) {
  return (
    <header className="pasv-book__bar">
      <button type="button" className="pasv-book__back" aria-label="Kembali" onClick={onBack}>
        <Icon icon={ChevronLeft} size="md" />
      </button>
      <h1 className="pasv-book__title">{title}</h1>
    </header>
  );
}
