import React, { useState } from 'react';
import { Button, Icon } from '../../design-system/index.js';
import {
  ChevronLeft, MapPin, Navigation, Car, Receipt, Tag, Wallet, Banknote,
  CreditCard, Star, Check, Loader2, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import * as papi from '../api.js';
import { formatIDR } from './pricingEngine.js';
import { OfflineBanner, useOnlineStatus } from './ux.jsx';
import './booking.css';

/**
 * BookingReview (3B-2G) — final booking confirmation.
 *
 * REUSES the Booking module (createBooking) plus the selections gathered
 * across 3B-2A..2F: pickup, destination, vehicle, fare, promo, payment.
 *
 * Flow: Review → (Confirm) Loading → Success | Failure.
 * On Success it calls `onSuccess(booking)` so the shell can navigate to the
 * Trip Waiting screen. No further state changes happen here.
 */

const METHOD_META = {
  wallet: { label: 'Dompet Ojol', icon: Wallet },
  cash: { label: 'Tunai', icon: Banknote },
  card: { label: 'Kartu Kredit', icon: CreditCard },
  saved: { label: 'Kartu Tersimpan', icon: Star },
};

export default function BookingReview({ payload, onBack, onSuccess }) {
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState('review'); // review | loading | success | error
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const online = useOnlineStatus();

  const {
    pickup, destination, vehicle, fare, route, surge, promo, voucher, method,
  } = payload || {};

  const confirm = async () => {
    if (!agree || status === 'loading') return;
    setStatus('loading');
    setError(null);
    try {
      const b = await papi.createBooking(payload);
      setBooking(b);
      setStatus('success');
      onSuccess?.(b);
    } catch (e) {
      setError(e?.message || 'Gagal membuat pesanan');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <Center><Loader2 className="pasv-br__spinner" size="xl" /><p>Membuat pesanan…</p></Center>;
  }
  if (status === 'success') {
    return (
      <Center>
        <div className="pasv-br__check" aria-hidden="true"><Icon icon={Check} size="xl" /></div>
        <h2 className="pasv-br__title">Pesanan dibuat</h2>
        <p className="pasv-br__sub">Mencari driver terdekat…</p>
        <p className="pasv-br__id">ID: {booking?.id}</p>
      </Center>
    );
  }

  const methodMeta = METHOD_META[method] || METHOD_META.wallet;
  const MethodIco = methodMeta.icon;
  const discount = (promo?.code && voucher?.amount) ? voucher.amount : 0;
  const promoLabel = promo?.title || (voucher ? `Voucher ${voucher.code}` : '—');

  return (
    <div className="pasv-book">
      <Bar onBack={onBack} title="Tinjau Pesanan" />
      {!online && <OfflineBanner />}

      <div className="pasv-book__scroll">
        {/* Pickup + Destination */}
        <section className="pasv-br__card">
          <Row icon={MapPin} label="Jemput" value={pickup?.address || pickup?.title || '—'} />
          <Row icon={Navigation} label="Tujuan" value={destination?.address || destination?.title || '—'} />
          {route && (
            <Row icon={null} label="Rute" value={`${route.distanceKm} km · ${route.durationMin} mnt`} />
          )}
        </section>

        {/* Vehicle */}
        <section className="pasv-br__card">
          <Row icon={Car} label="Kendaraan" value={vehicle?.name || '—'} />
          {vehicle?.capacityLabel && (
            <Row icon={null} label="Kapasitas" value={vehicle.capacityLabel} />
          )}
          {surge?.multiplier > 1 && (
            <Row icon={null} label="Harga dinamis" value={`×${surge.multiplier.toFixed(2)} (${surge.level})`} tone="warn" />
          )}
        </section>

        {/* Fare */}
        <section className="pasv-br__card">
          <Row icon={Receipt} label="Total tarif" value={formatIDR(fare?.finalFare, fare?.currency)} bold />
        </section>

        {/* Promo */}
        <section className="pasv-br__card">
          <Row icon={Tag} label="Promo / Voucher" value={promoLabel} />
          {discount > 0 && <Row icon={null} label="Potongan" value={`− ${formatIDR(discount)}`} tone="ok" />}
        </section>

        {/* Payment */}
        <section className="pasv-br__card">
          <Row icon={MethodIco} label="Pembayaran" value={methodMeta.label} />
        </section>

        {/* Terms */}
        <label className="pasv-br__terms">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            <Icon icon={ShieldCheck} size="xs" /> Saya menyetujui syarat &amp; ketentuan serta kebijakan privasi Ojol.
          </span>
        </label>

        {status === 'error' && (
          <div className="pasv-br__error" role="alert">
            <Icon icon={AlertTriangle} size="sm" /> {error}
          </div>
        )}

        <Button
          variant="primary"
          className="pasv-book__confirm-btn"
          disabled={!agree}
          onClick={confirm}
        >
          Konfirmasi Pesanan · {formatIDR(fare?.finalFare, fare?.currency)}
        </Button>
      </div>
    </div>
  );
}

function Row({ icon: Ico, label, value, bold, tone }) {
  return (
    <div className="pasv-br__row">
      {Ico && <span className="pasv-br__row-ico"><Icon icon={Ico} size="sm" /></span>}
      <span className="pasv-br__row-label">{label}</span>
      <span className={`pasv-br__row-value ${bold ? 'pasv-br__row-value--bold' : ''} ${tone ? `pasv-br__row-value--${tone}` : ''}`}>{value}</span>
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

function Center({ children }) {
  return <div className="pasv-br__center">{children}</div>;
}
