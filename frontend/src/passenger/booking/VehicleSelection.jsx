import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ErrorState, Icon,
} from '../../design-system/index.js';
import { ChevronLeft, Bike, Car, Users, Clock, MapPin, Navigation, Zap, ShieldCheck, Info } from 'lucide-react';
import * as papi from '../api.js';
import { VEHICLES, estimateFare, formatIDR } from './pricingEngine.js';
import { VehicleListSkeleton, OfflineBanner, RetryButton, useOnlineStatus } from './ux.jsx';
import BookingMap from './BookingMap/index.js';
import './booking.css';

const ICONS = { bike: Bike, car: Car };
// Lucide has no "car-xl"; reuse Car with a tint.
const VEHICLE_ICON = (vehicle) => ICONS[vehicle.icon] || Car;

/**
 * Mock dynamic-pricing (surge) signal.
 *
 * Mirrors the backend `SurgePricingService` intent: the multiplier reflects
 * current demand. Here we synthesize it from the local hour so the UI shows
 * real dynamic-pricing behaviour (no fixed price). Swap for a live surge feed
 * `/api/v1/pricing/surge` when available — the shape `{multiplier, level}` is
 * what the screen reads.
 */
function getSurgeSignal() {
  const hour = new Date().getHours();
  // Simulate peak hours (07–09, 17–19) with elevated demand.
  const peak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const shoulder = (hour >= 10 && hour <= 12) || (hour >= 20 && hour <= 21);
  const multiplier = peak ? 1.8 : shoulder ? 1.3 : 1.0;
  const level = multiplier >= 1.8 ? 'Tinggi' : multiplier >= 1.3 ? 'Sedang' : 'Normal';
  return { multiplier, level };
}

export default function VehicleSelection({ destination, pickup, user, onBack, onConfirmVehicle }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [route, setRoute] = useState(null);
  const [surge, setSurge] = useState({ multiplier: 1, level: 'Normal' });
  const [selected, setSelected] = useState('car');
  const [expanded, setExpanded] = useState(null);
  const online = useOnlineStatus();

  const load = () => {
    let cancelled = false;
    setStatus('loading');
    Promise.all([papi.getRoute(pickup, destination), Promise.resolve(getSurgeSignal())])
      .then(([r, s]) => {
        if (cancelled) return;
        setRoute(r); setSurge(s); setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  };

  useEffect(load, [pickup, destination]);

  // Estimate fare for every vehicle using the SHARED pricing engine so the
  // numbers match what Fare Review (3B-2D) will show.
  const priced = useMemo(() => {
    if (!route) return [];
    return VEHICLES.map((v) => {
      const fare = estimateFare(v, { distanceKm: route.distanceKm, durationMin: route.durationMin }, { surgeMultiplier: surge.multiplier });
      // ETA scales a little with vehicle class (bikes beat traffic).
      const eta = Math.max(2, Math.round(route.durationMin * (v.id === 'bike' ? 0.8 : 1)));
      return { vehicle: v, fare, eta };
    });
  }, [route, surge]);

  const selectedEntry = priced.find((p) => p.vehicle.id === selected) || priced[0];

  const confirm = () => {
    if (!selectedEntry) return;
    onConfirmVehicle?.({
      vehicle: selectedEntry.vehicle,
      eta: selectedEntry.eta,
      fare: selectedEntry.fare,
      route,
      surge,
    });
  };

  if (status === 'error') {
    return (
      <div className="pasv-book">
        <Bar onBack={onBack} title="Pilih Kendaraan" />
        <div className="pasv-book__scroll">
          <ErrorState
            title="Gagal memuat"
            description="Tidak dapat menghitung rute dan harga."
            action={<RetryButton onRetry={load} />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pasv-book">
      <Bar onBack={onBack} title="Pilih Kendaraan" />
      {!online && <OfflineBanner onRetry={load} />}

      {status === 'loading' ? (
        <div className="pasv-book__scroll">
          <VehicleListSkeleton />
        </div>
      ) : (
        <>
          <BookingMap
            pickup={pickup}
            destination={destination}
            onCurrentLocation={() => {}}
            sheetContent={
              <>
                {/* Dynamic pricing banner */}
                <SurgeBanner surge={surge} />

                {/* Available vehicles */}
                <div className="pasv-veh__list" role="radiogroup" aria-label="Pilih kendaraan">
                  {priced.map(({ vehicle, fare, eta }) => {
                    const Ico = VEHICLE_ICON(vehicle);
                    const active = selected === vehicle.id;
                    const open = expanded === vehicle.id;
                    return (
                      <div key={vehicle.id} className={`pasv-veh ${active ? 'pasv-veh--active' : ''}`}>
                        <button
                          type="button"
                          className="pasv-veh__main"
                          role="radio"
                          aria-checked={active}
                          aria-expanded={open}
                          onClick={() => { setSelected(vehicle.id); setExpanded(open ? null : vehicle.id); }}
                        >
                          <span className="pasv-veh__icon" data-tone={vehicle.tone}><Icon icon={Ico} size="md" /></span>
                          <span className="pasv-veh__body">
                            <span className="pasv-veh__name">{vehicle.name}</span>
                            <span className="pasv-veh__meta">
                              <span className="pasv-veh__meta-item"><Icon icon={Clock} size="xs" /> {eta} mnt</span>
                              <span className="pasv-veh__meta-item"><Icon icon={Users} size="xs" /> {vehicle.capacityLabel}</span>
                            </span>
                          </span>
                          <span className="pasv-veh__fare">{formatIDR(fare.finalFare)}</span>
                        </button>

                        {open && (
                          <div className="pasv-veh__details">
                            <p className="pasv-veh__desc">
                              <Icon icon={Info} size="xs" /> {vehicle.description}
                            </p>
                            <ul className="pasv-veh__specs">
                              <li><Icon icon={MapPin} size="xs" /> Jarak {route.distanceKm} km</li>
                              <li><Icon icon={Clock} size="xs" /> Estimasi {eta} menit</li>
                              <li><Icon icon={Users} size="xs" /> Kapasitas {vehicle.capacityLabel}</li>
                              <li><Icon icon={ShieldCheck} size="xs" /> Asuransi penumpang</li>
                            </ul>
                            <ul className="pasv-veh__breakdown">
                              {fare.components.filter((c) => c.amount !== 0).map((c) => (
                                <li key={c.code}>
                                  <span>{c.label}</span>
                                  <span className={c.amount < 0 ? 'pasv-veh__neg' : ''}>{formatIDR(c.amount)}</span>
                                </li>
                              ))}
                              <li className="pasv-veh__total">
                                <span>Total estimasi</span>
                                <span>{formatIDR(fare.finalFare)}</span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button type="button" className="pasv-book__confirm-btn" onClick={confirm}>
                  Pilih {selectedEntry?.vehicle.name}
                  <span className="pasv-book__confirm-fare">{selectedEntry ? formatIDR(selectedEntry.fare.finalFare) : ''}</span>
                </button>
              </>
            }
          />
        </>
      )}
    </div>
  );
}

function SurgeBanner({ surge }) {
  if (surge.multiplier <= 1) {
    return (
      <div className="pasv-veh__surge pasv-veh__surge--normal">
        <Icon icon={Zap} size="xs" /> Harga normal · tidak ada surge saat ini
      </div>
    );
  }
  return (
    <div className="pasv-veh__surge pasv-veh__surge--active" role="status">
      <Icon icon={Zap} size="xs" /> Harga dinamis ×{surge.multiplier.toFixed(2)} ({surge.level})
    </div>
  );
}

function Bar({ onBack, title }) {
  return (
    <header className="pasv-book__bar">
      <button type="button" className="pasv-book__back" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="md" /></button>
      <h1 className="pasv-book__title">{title}</h1>
    </header>
  );
}
