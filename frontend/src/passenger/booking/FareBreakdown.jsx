import React from 'react';
import { Icon } from '../../design-system/index.js';
import { ChevronLeft, Receipt, Zap, Tag, Percent, Wallet } from 'lucide-react';
import { estimateFare, formatIDR } from './pricingEngine.js';
import './booking.css';

/**
 * FareBreakdown (3B-2E) — read-only fare breakdown display.
 *
 * REUSES the shared Pricing Engine so the numbers are identical to what
 * Vehicle Selection (3B-2C) and Fare Review (3B-2D) show. Given either:
 *   - a precomputed `fare` ({ components, finalFare, currency }) produced by
 *     the engine elsewhere, OR
 *   - the raw inputs ({ vehicle, route, surge, discount }) which it computes
 *     itself via `estimateFare(...)`.
 *
 * Always renders the canonical lines required by 3B-2E:
 *   Base Fare · Distance · Time · Surge · Discount · Taxes · Final Price.
 *
 * This is a DISPLAY-ONLY component: it never creates a booking. "Stop after
 * completion" — there is no confirm action here.
 */

// Canonical line order for 3B-2E (codes match the Pricing Engine components).
const LINE_ORDER = [
  { code: 'base_fare', icon: Receipt, label: 'Tarif dasar' },
  { code: 'distance_fare', icon: null, label: 'Jarak' },
  { code: 'duration_fare', icon: null, label: 'Waktu' },
  { code: 'surge', icon: Zap, label: 'Surge (harga dinamis)' },
  { code: 'discount', icon: Tag, label: 'Diskon' },
  { code: 'tax', icon: Percent, label: 'Pajak' },
];

export default function FareBreakdown({
  fare,
  vehicle,
  route,
  surge,
  discount = 0,
  currency = 'IDR',
  title = 'Rincian Tarif',
  onBack,
}) {
  // Resolve the fare via the engine when raw inputs are supplied.
  const resolved = fare || (
    vehicle && route
      ? estimateFare(vehicle, { distanceKm: route.distanceKm, durationMin: route.durationMin }, {
          surgeMultiplier: surge?.multiplier,
          promoDiscount: discount > 0 ? discount : 0,
        })
      : null
  );

  const components = resolved?.components || [];
  const cur = resolved?.currency || currency;
  const byCode = (code) => components.find((c) => c.code === code);

  const base = byCode('base_fare');
  const distance = byCode('distance_fare');
  const time = byCode('duration_fare');
  const surgeC = byCode('surge');
  const promo = byCode('promo_discount');
  const voucher = byCode('voucher_discount');
  const tax = byCode('tax');

  // Discount line = sum of promo + voucher (engine stores these as negatives).
  const discountTotal = Math.round((promo?.amount || 0) + (voucher?.amount || 0));

  const finalFare = resolved?.finalFare ?? 0;

  return (
    <div className="pasv-fare2">
      {onBack && (
        <header className="pasv-book__bar">
          <button type="button" className="pasv-book__back" aria-label="Kembali" onClick={onBack}>
            <Icon icon={ChevronLeft} size="md" />
          </button>
          <h1 className="pasv-book__title">{title}</h1>
        </header>
      )}

      <main className="pasv-fare2__scroll">
        <div className="pasv-fare2__card" role="group" aria-label="Rincian tarif">
          <Line
            icon={base?.icon}
            label={base?.label || 'Tarif dasar'}
            amount={base?.amount}
            currency={cur}
          />
          <Line
            icon={distance?.icon}
            label={distance?.label || 'Jarak'}
            amount={distance?.amount}
            currency={cur}
          />
          <Line
            icon={time?.icon}
            label={time?.label || 'Waktu'}
            amount={time?.amount}
            currency={cur}
          />
          <Line
            icon={surgeC?.icon}
            label={surgeC?.label || 'Surge (harga dinamis)'}
            amount={surgeC?.amount}
            currency={cur}
          />
          <Line
            icon={promo?.icon || voucher?.icon}
            label="Diskon"
            amount={discountTotal} // negative => shown as a deduction
            currency={cur}
            negative
          />
          <Line
            icon={tax?.icon}
            label={tax?.label || 'Pajak'}
            amount={tax?.amount}
            currency={cur}
          />

          <div className="pasv-fare2__total">
            <span className="pasv-fare2__total-label">
              <Icon icon={Wallet} size="sm" /> Total harga
            </span>
            <span className="pasv-fare2__total-amount">{formatIDR(finalFare, cur)}</span>
          </div>
        </div>

        <p className="pasv-fare2__note">
          Estimasi harga berdasarkan rute &amp; permintaan saat ini. Belum termasuk biaya tambahan
          diluar rute (contoh: tol). Pemesanan belum dilakukan.
        </p>
      </main>
    </div>
  );
}

function Line({ icon: Ico, label, amount, currency, negative }) {
  const isNeg = negative || (typeof amount === 'number' && amount < 0);
  const display = amount == null ? '—' : formatIDR(amount, currency);
  return (
    <div className="pasv-fare2__line">
      <span className="pasv-fare2__label">
        {Ico && <Icon icon={Ico} size="xs" />}
        {label}
      </span>
      <span className={`pasv-fare2__amount ${isNeg ? 'pasv-fare2__amount--neg' : ''}`}>{display}</span>
    </div>
  );
}
