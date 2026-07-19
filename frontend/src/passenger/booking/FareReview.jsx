import React from 'react';
import { Button, Icon } from '../../design-system/index.js';
import { ChevronLeft, Bike, Car, Users, Clock, MapPin, Navigation, Zap, ShieldCheck, Wallet, CreditCard } from 'lucide-react';
import { formatIDR } from './pricingEngine.js';
import BookingMap from './BookingMap/index.js';
import './booking.css';

const ICONS = { bike: Bike, car: Car };

/**
 * FareReview (3B-2D) — final review before booking.
 *
 * Reuses the SAME pricing result object produced by Vehicle Selection (3B-2C)
 * via the shared Pricing Engine, so the fare breakdown is authoritative and
 * consistent. Summarizes: vehicle + details, route, full fare breakdown, and
 * payment method selection.
 *
 * This screen is the STOP point for the phase: continuing prompts the user to
 * confirm but does not (yet) create the order.
 */
export default function FareReview({ destination, pickup, vehicle, fare, route, surge, user, onBack, onConfirm, onViewBreakdown, onProceedToPayment }) {
  const Ico = ICONS[vehicle?.icon] || Car;
  const components = fare?.components || [];

  return (
    <div className="pasv-book">
      <header className="pasv-book__bar">
        <button type="button" className="pasv-book__back" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="md" /></button>
        <h1 className="pasv-book__title">Tinjau Tarif</h1>
      </header>

      <BookingMap
        pickup={pickup}
        destination={destination}
        onCurrentLocation={() => {}}
        sheetContent={
          <>
            {/* Vehicle summary */}
            <div className="pasv-fare__vehicle">
              <span className="pasv-veh__icon" data-tone={vehicle?.tone}><Icon icon={Ico} size="md" /></span>
              <div className="pasv-fare__vehicle-body">
                <div className="pasv-fare__vehicle-name">{vehicle?.name}</div>
                <div className="pasv-fare__vehicle-meta">
                  <span><Icon icon={Clock} size="xs" /> {route?.durationMin} mnt</span>
                  <span><Icon icon={MapPin} size="xs" /> {route?.distanceKm} km</span>
                  <span><Icon icon={Users} size="xs" /> {vehicle?.capacityLabel}</span>
                  <span><Icon icon={ShieldCheck} size="xs" /> Asuransi</span>
                </div>
              </div>
            </div>

            {/* Dynamic pricing tag */}
            {surge?.multiplier > 1 && (
              <div className="pasv-veh__surge pasv-veh__surge--active" role="status">
                <Icon icon={Zap} size="xs" /> Harga dinamis ×{surge.multiplier.toFixed(2)} ({surge.level})
              </div>
            )}

            {/* Full fare breakdown */}
            <div className="pasv-fare__breakdown">
              <h2 className="pasv-book__section-title">Rincian tarif</h2>
              <ul className="pasv-fare__list">
                {components.filter((c) => c.amount !== 0).map((c) => (
                  <li key={c.code}>
                    <span className="pasv-fare__label">{c.label}</span>
                    <span className={`pasv-fare__amount ${c.amount < 0 ? 'pasv-fare__neg' : ''}`}>{formatIDR(c.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="pasv-fare__total">
                <span>Total dibayar</span>
                <span className="pasv-fare__total-amount">{formatIDR(fare?.finalFare)}</span>
              </div>
            </div>

            {/* Payment method (display only — booking creation is out of scope) */}
            <div className="pasv-fare__pay">
              <h2 className="pasv-book__section-title">Metode pembayaran</h2>
              <div className="pasv-fare__pay-row" role="radiogroup" aria-label="Metode pembayaran">
                <span className="pasv-fare__pay-item pasv-fare__pay-item--active" role="radio" aria-checked="true">
                  <Icon icon={Wallet} size="sm" /> Dompet Ojol
                </span>
                <span className="pasv-fare__pay-item" aria-hidden="true">
                  <Icon icon={CreditCard} size="sm" /> Kartu / Tunai
                </span>
              </div>
            </div>

            <button type="button" className="pasv-fare__breakdown-link" onClick={() => onViewBreakdown?.()}>
              Lihat rincian lengkap
            </button>

            <button type="button" className="pasv-fare__breakdown-link" onClick={() => onProceedToPayment?.()}>
              Pilih pembayaran →
            </button>

            <button type="button" className="pasv-book__confirm-btn" onClick={() => onConfirm?.({ vehicle, fare, route, surge, pickup, destination })}>
              Pesan {vehicle?.name} · {formatIDR(fare?.finalFare)}
            </button>
          </>
        }
      />
    </div>
  );
}
