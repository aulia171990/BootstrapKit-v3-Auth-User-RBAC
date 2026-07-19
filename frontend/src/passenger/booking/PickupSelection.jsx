import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer, CurrentLocationButton, Input, Button, EmptyState, Loading, ErrorState, Icon,
} from '../../design-system/index.js';
import { ChevronLeft, MapPin, LocateFixed, Search as SearchIcon, Navigation, X } from 'lucide-react';
import * as papi from '../api.js';
import './booking.css';

/**
 * PickupSelection (3B-2B) — choose a pickup point.
 * - Draggable map: panning the surface moves the pin's coordinate (no map engine needed).
 * - Search / current location / saved pickups set the address + center.
 * - Confirm → onConfirmPickup(pickup) (→ Vehicle Selection, 3B-2C, not built here).
 */
export default function PickupSelection({ destination, user, onBack, onConfirmPickup }) {
  const [status, setStatus] = useState('loading');
  const [currentLoc, setCurrentLoc] = useState(null);
  const [saved, setSaved] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [addr, setAddr] = useState('');
  const [coord, setCoord] = useState({ lat: -6.2, lng: 106.816 });
  const [searching, setSearching] = useState(false);
  const drag = useRef(null);
  const mapRef = useRef(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [loc, favs] = await Promise.all([papi.getCurrentLocation(), papi.getSavedPickups()]);
      setCurrentLoc(loc); setSaved(favs);
      setAddr(loc?.address || '');
      setStatus('ready');
    } catch { setStatus('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) { setSuggestions([]); return; }
    setSearching(true);
    papi.getPickupSuggestions(query).then((res) => {
      if (cancelled) return;
      setSuggestions(res); setSearching(false);
    }).catch(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [query]);

  // Drag the map surface → move the pin coordinate (1px ≈ 0.0002°).
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, lat: coord.lat, lng: coord.lng };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = (e.clientX ?? 0) - drag.current.x;
    const dy = (e.clientY ?? 0) - drag.current.y;
    setCoord({
      lat: +(drag.current.lat - dy * 0.00025).toFixed(5),
      lng: +(drag.current.lng + dx * 0.00025).toFixed(5),
    });
  };
  const onPointerUp = (e) => { drag.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId); };

  const choose = (place) => {
    setAddr(place.title + (place.subtitle ? ` — ${place.subtitle}` : ''));
    setQuery(''); setSuggestions([]);
  };
  const useCurrent = () => {
    setAddr(currentLoc?.address || 'Lokasi saat ini');
    setCoord({ lat: -6.2, lng: 106.816 });
  };
  const confirm = () => onConfirmPickup?.({ address: addr || currentLoc?.address, coord, destination });

  if (status === 'error') {
    return (
      <div className="pasv-book">
        <Bar onBack={onBack} title="Pilih Titik Jemput" />
        <div className="pasv-book__scroll"><ErrorState title="Gagal memuat" description="Tidak dapat mengambil lokasi." action={<Button onClick={load}>Coba lagi</Button>} /></div>
      </div>
    );
  }

  return (
    <div className="pasv-book">
      <Bar onBack={onBack} title="Pilih Titik Jemput" />

      {status === 'loading' ? (
        <div className="pasv-book__scroll"><Loading label="Memuat peta…" /></div>
      ) : (
        <>
          {/* Search pickup */}
          <div className="pasv-book__search" style={{ padding: 'var(--ds-space-4)' }}>
            <Input
              leftIcon={SearchIcon}
              placeholder="Cari titik jemput…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari titik jemput"
              autoComplete="off"
            />
            {searching && <span className="pasv-book__spinner"><Loading size="sm" /></span>}
            {query && <button type="button" className="pasv-book__spinner pasv-iconbtn" style={{ right: 36, width: 32, height: 32 }} aria-label="Hapus" onClick={() => setQuery('')}><Icon icon={X} size="xs" /></button>}
            {suggestions.length > 0 && (
              <ul className="pasv-book__list" role="list" aria-label="Hasil pencarian" style={{ marginTop: 'var(--ds-space-2)' }}>
                {suggestions.map((s) => (
                  <li key={s.id}><button type="button" className="pasv-book__row" onClick={() => choose(s)}>
                    <span className="pasv-book__row__icon"><Icon icon={MapPin} size="sm" /></span>
                    <span className="pasv-book__row__body"><span className="pasv-book__row__title">{s.title}</span>{s.subtitle && <span className="pasv-book__row__sub">{s.subtitle}</span>}</span>
                  </button></li>
                ))}
              </ul>
            )}
          </div>

          {/* Map with draggable pin */}
          <div
            ref={mapRef}
            className="pasv-pickup__map"
            role="application"
            aria-label="Peta titik jemput — seret untuk memindahkan pin"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <MapContainer height="100%" placeholder="Peta titik jemput">
              <CurrentLocationButton active onClick={useCurrent} />
            </MapContainer>
            <span className="pasv-pickup__center-dot" />
            <div className="pasv-pickup__pin">
              <span className="pasv-pickup__pin-pulse" />
              <span className="pasv-pickup__pin-pin"><Icon icon={MapPin} size="sm" /></span>
            </div>
            <span className="pasv-pickup__coords">{coord.lat}, {coord.lng}</span>
          </div>

          {/* Current + saved shortcuts */}
          <div className="pasv-book__scroll" style={{ paddingTop: 0 }}>
            <div className="pasv-book__shortcuts" role="group" aria-label="Pintasan titik jemput" style={{ marginBottom: 'var(--ds-space-3)' }}>
              <button type="button" className="pasv-book__shortcut" onClick={useCurrent} aria-label="Gunakan lokasi saat ini">
                <span className="pasv-book__shortcut__icon" style={{ background: '#0ea5e9' }}><Icon icon={LocateFixed} size="md" /></span>
                <span className="pasv-book__shortcut__label">Lokasi</span>
              </button>
            </div>

            {saved.length > 0 && (
              <section aria-label="Tempat tersimpan" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
                <h2 className="pasv-book__section-title">Tempat tersimpan</h2>
                {saved.map((s) => (
                  <button key={s.id} type="button" className="pasv-book__row" onClick={() => choose(s)}>
                    <span className="pasv-book__row__icon"><Icon icon={MapPin} size="sm" /></span>
                    <span className="pasv-book__row__body"><span className="pasv-book__row__title">{s.title}</span>{s.subtitle && <span className="pasv-book__row__sub">{s.subtitle}</span>}</span>
                  </button>
                ))}
              </section>
            )}
          </div>

          {/* Confirm bar */}
          <div className="pasv-pickup__confirm">
            <span className="pasv-pickup__confirm-body">
              <span className="pasv-pickup__confirm-label">Titik jemput</span>
              <div className="pasv-pickup__confirm-addr">{addr || 'Seret peta untuk menentukan titik'}</div>
            </span>
            <Button variant="primary" leftIcon={Navigation} onClick={confirm}>Konfirmasi</Button>
          </div>
        </>
      )}
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
