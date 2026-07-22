import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '../../design-system/index.js';
import {
  ChevronLeft, MapPin, Navigation, Car, Bike, Clock, Zap, Edit3, ArrowRight,
} from 'lucide-react';
import { VEHICLES, estimateFare, formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import './repeatBooking.css';

const ICONS = { bike: Bike, car: Car };
const VEHICLE_ICON = (v) => ICONS[v.icon] || Car;

// Mirror VehicleSelection's demand-based surge signal (no duplicated booking
// logic — just the same pricing-engine input the Booking module reads).
function getSurgeSignal() {
  const hour = new Date().getHours();
  const peak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const shoulder = (hour >= 10 && hour <= 12) || (hour >= 20 && hour <= 21);
  const multiplier = peak ? 1.8 : shoulder ? 1.3 : 1.0;
  const level = multiplier >= 1.8 ? 'Tinggi' : multiplier >= 1.3 ? 'Sedang' : 'Normal';
  return { multiplier, level };
}

/**
 * RepeatBooking (Sprint 5, 3E-5E) — re-book a past trip.
 *
 * REUSES the Booking module (no duplicated booking logic):
 *   - papi.getRoute + estimateFare (shared Pricing Engine) to RECALCULATE the
 *     fare whenever pickup/destination change — same engine VehicleSelection
 *     (3B-2C) uses, so numbers match exactly.
 *   - VEHICLES + estimateFare for the inline vehicle picker.
 *   - "Proceed to Booking" hands the selection to the EXISTING vehicle view
 *     (VehicleSelection → FareReview → PaymentSelection → BookingReview →
 *     papi.createBooking). No booking is created here.
 */
export default function RepeatBooking({ trip, prefill, onBack, onProceed }) {
  const initPickup = trip?.pickup || prefill?.title?.split(' → ')?.[0] || prefill?.pickup || 'Rumah';
  const initDest = trip?.destination || prefill?.title?.split(' → ')?.[1] || prefill?.destination || 'Kantor';

  const [pickup, setPickup] = useState(initPickup);
  const [destination, setDestination] = useState(initDest);
  const [editing, setEditing] = useState(null); // 'pickup' | 'destination' | null
  const [route, setRoute] = useState(null);
  const [surge, setSurge] = useState({ multiplier: 1, level: 'Normal' });
  const [selected, setSelected] = useState(trip?.vehicleKey || 'car');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([papi.getRoute({ address: pickup }, { address: destination }), Promise.resolve(getSurgeSignal())])
      .then(([r, s]) => { if (!cancelled) { setRoute(r); setSurge(s); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pickup, destination]);

  // Recalculated fare per vehicle via the shared Pricing Engine.
  const priced = useMemo(() => {
    if (!route) return [];
    return VEHICLES.map((v) => {
      const fare = estimateFare(v, { distanceKm: route.distanceKm, durationMin: route.durationMin }, { surgeMultiplier: surge.multiplier });
      const eta = Math.max(2, Math.round(route.durationMin * (v.id === 'bike' ? 0.8 : 1)));
      return { vehicle: v, fare, eta };
    });
  }, [route, surge]);

  const selectedEntry = priced.find((p) => p.vehicle.id === selected) || priced[0];

  // Edit handlers
  const commitEdit = (field, value) => {
    const v = value.trim();
    if (field === 'pickup') setPickup(v || pickup);
    else setDestination(v || destination);
    setEditing(null);
  };

  const proceed = () => {
    if (!selectedEntry || !route) return;
    // Hand off to the existing Booking module flow (vehicle → fare → pay → confirm).
    onProceed?.({
      pickup: { address: pickup },
      destination: { address: destination },
      vehicle: selectedEntry.vehicle,
      fare: selectedEntry.fare,
      route,
      surge,
    });
  };

  return (
    <div className="pasv-rb">
      <header className="pasv-rb__bar">
        {onBack && (
          <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}>
            <Icon icon={ChevronLeft} size="md" />
          </button>
        )}
        <h1 className="pasv-rb__title">Pesan Lagi</h1>
        <span className="pasv-rb__bar-spacer" />
      </header>

      <main className="pasv-rb__body">
        {/* Pickup / Destination (editable) */}
        <section className="pasv-rb__locs" aria-label="Lokasi">
          <EditRow
            icon={MapPin} tone="pick"
            label="Jemput" value={pickup}
            editing={editing === 'pickup'}
            onEdit={() => setEditing('pickup')}
            onCommit={(v) => commitEdit('pickup', v)}
            onCancel={() => setEditing(null)}
          />
          <div className="pasv-rb__connector" aria-hidden><Icon icon={Navigation} size="xs" /></div>
          <EditRow
            icon={Navigation} tone="dest"
            label="Tujuan" value={destination}
            editing={editing === 'destination'}
            onEdit={() => setEditing('destination')}
            onCommit={(v) => commitEdit('destination', v)}
            onCancel={() => setEditing(null)}
          />
        </section>

        {/* Recalculated fare banner */}
        <section className="pasv-rb__fare" aria-label="Estimasi tarif">
          {loading || !route ? (
            <span className="pasv-rb__fare-muted">Menghitung ulang rute…</span>
          ) : (
            <>
              {surge.multiplier > 1 && (
                <span className="pasv-rb__surge"><Icon icon={Zap} size="xs" /> Harga dinamis ×{surge.multiplier.toFixed(2)} ({surge.level})</span>
              )}
              <span className="pasv-rb__fare-main">
                {route.distanceKm} km · {route.durationMin} mnt
                {selectedEntry && <> · <strong>{formatIDR(selectedEntry.fare.finalFare)}</strong></>}
              </span>
            </>
          )}
        </section>

        {/* Select Vehicle (reuses VEHICLES + Pricing Engine) */}
        <section className="pasv-rb__veh" aria-label="Pilih kendaraan">
          <h2 className="pasv-rb__h2"><Car size="sm" /> Pilih Kendaraan</h2>
          {loading || !priced.length ? (
            <div className="pasv-rb__veh-skel"><span /><span /><span /></div>
          ) : (
            <div className="pasv-rb__veh-list" role="radiogroup" aria-label="Kendaraan">
              {priced.map(({ vehicle, fare, eta }) => {
                const Ico = VEHICLE_ICON(vehicle);
                const active = selected === vehicle.id;
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    className={`pasv-rb__veh-item ${active ? 'is-active' : ''}`}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(vehicle.id)}
                  >
                    <span className="pasv-rb__veh-ico" data-tone={vehicle.tone}><Icon icon={Ico} size="md" /></span>
                    <span className="pasv-rb__veh-body">
                      <span className="pasv-rb__veh-name">{vehicle.name}</span>
                      <span className="pasv-rb__veh-meta"><Icon icon={Clock} size="xs" /> {eta} mnt</span>
                    </span>
                    <span className="pasv-rb__veh-fare">{formatIDR(fare.finalFare)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <Button
          variant="primary"
          fullWidth
          disabled={loading || !selectedEntry}
          onClick={proceed}
        >
          Lanjutkan Pemesanan <Icon icon={ArrowRight} size="sm" />
        </Button>
      </main>
    </div>
  );
}

function EditRow({ icon: Ico, tone, label, value, editing, onEdit, onCommit, onCancel }) {
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <div className="pasv-rb__edit">
        <span className={`pasv-rb__dot pasv-rb__dot--${tone}`}><Icon icon={Ico} size="xs" /></span>
        <div className="pasv-rb__edit-body">
          <label className="pasv-rb__edit-label">{label}</label>
          <div className="pasv-rb__edit-row">
            <input
              className="pasv-rb__input"
              value={draft}
              aria-label={`Edit ${label}`}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <button type="button" className="pasv-rb__edit-ok" aria-label="Simpan" onClick={() => onCommit(draft)}>Simpan</button>
            <button type="button" className="pasv-rb__edit-cancel" aria-label="Batal" onClick={onCancel}>Batal</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pasv-rb__loc">
      <span className={`pasv-rb__dot pasv-rb__dot--${tone}`}><Icon icon={Ico} size="xs" /></span>
      <div className="pasv-rb__loc-body">
        <span className="pasv-rb__loc-label">{label}</span>
        <span className="pasv-rb__loc-value">{value}</span>
      </div>
      <button type="button" className="pasv-rb__edit-btn" aria-label={`Edit ${label}`} onClick={onEdit}>
        <Icon icon={Edit3} size="sm" />
      </button>
    </div>
  );
}
