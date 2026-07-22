import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, SearchBar, FilterBar,
} from '../../design-system/index.js';
import {
  Clock, MapPin, Navigation, Car, Wallet, Star, Search, SlidersHorizontal,
  ChevronRight, ArrowUpRight, ArrowDownLeft, RefreshCw, WifiOff, Heart,
  CreditCard, CalendarRange, Ban, RotateCcw, Filter, X, LifeBuoy,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import { usePullToRefresh } from '../wallet/usePullToRefresh.js';
import './activity.css';

const RECENT_LIMIT = 5;

// Statuses the filter chips support (mapped to backend trip.status values).
const STATUS_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
  { id: 'refunded', label: 'Refund' },
];
const VEHICLE_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'car', label: 'Mobil' },
  { id: 'motor', label: 'Motor' },
  { id: 'bike', label: 'Sepeda' },
];
const METHOD_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'wallet', label: 'Dompet' },
  { id: 'card', label: 'Kartu' },
  { id: 'cash', label: 'Tunai' },
];

const TX_ICON = { trip: ArrowUpRight, topup: ArrowDownLeft, refund: ArrowDownLeft, withdrawal: ArrowUpRight };

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function money(n) { return formatIDR(Math.abs(n)); }
function signedAmt(n) { return `${n < 0 ? '-' : '+'} ${money(n)}`; }

/**
 * ActivityHome — Passenger Activity hub (Sprint 5, 3E-5A).
 *
 * REUSES (no duplicated business logic):
 *   - papi.fetchRecentTrips / getOngoingTrip / getFavoriteTrips / getRecentPayments
 *     (all API-first, backed by the real backend Trip/Booking/Wallet APIs with
 *     a clearly-labelled demo fallback when the backend is unreachable).
 *   - getTransactions (Wallet API) for "recent payments".
 *   - formatIDR (shared Pricing Engine) for all currency formatting.
 *   - design-system: Button / Icon / Badge / Skeleton / EmptyState / ErrorState /
 *     SearchBar / FilterBar.
 *   - usePullToRefresh (shared, from wallet module).
 *
 * Sections: Ongoing Trip · Recent Trips · Recent Payments · Favorite Trips ·
 * Quick Filters · Search. Bottom navigation lives in PassengerApp.
 *
 * States: loading (Skeleton), empty, offline (banner + retry), error.
 */
export default function ActivityHome({
  onTripDetail, onOngoingTrip, onPaymentDetail, onFavoriteTrip,
  onViewAllTrips, onViewAllPayments, onFilter, onSearch, onRetry, onRefundSupport,
}) {
  const [trips, setTrips] = useState(null);
  const [ongoing, setOngoing] = useState(null);
  const [payments, setPayments] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [vehicle, setVehicle] = useState('all');
  const [method, setMethod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const load = async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [t, o, p, f] = await Promise.all([
        papi.fetchRecentTrips(RECENT_LIMIT + 10),
        papi.getOngoingTrip(),
        papi.getRecentPayments(RECENT_LIMIT),
        papi.getFavoriteTrips(),
      ]);
      setTrips(t); setOngoing(o); setPayments(p); setFavorites(f);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline]);

  const refresh = () => { onRetry?.(); load(); };
  const { containerRef, pullDistance, refreshing } = usePullToRefresh(refresh);

  // Count active filters for the chip badge.
  useEffect(() => {
    let c = 0;
    if (status !== 'all') c += 1;
    if (vehicle !== 'all') c += 1;
    if (method !== 'all') c += 1;
    if (dateFrom) c += 1;
    if (dateTo) c += 1;
    setActiveFilterCount(c);
  }, [status, vehicle, method, dateFrom, dateTo]);

  // ── Filter + search logic (client-side over the loaded trip list) ──
  const filteredTrips = useMemo(() => {
    const list = trips || [];
    const q = query.trim().toLowerCase();
    return list.filter((t) => {
      if (q) {
        const hay = `${t.pickup} ${t.destination} ${t.driverName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== 'all') {
        if (status === 'refunded') { if (t.status !== 'cancelled') return false; }
        else if (t.status !== status) return false;
      }
      if (vehicle !== 'all' && (t.vehicle || '').toLowerCase() !== vehicle) return false;
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo); end.setHours(23, 59, 59, 999);
        if (new Date(t.date) > end) return false;
      }
      return true;
    });
  }, [trips, query, status, vehicle, dateFrom, dateTo]);

  const filteredPayments = useMemo(() => {
    const list = payments || [];
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (method !== 'all') {
        const m = (p.method || '').toLowerCase();
        if (method === 'wallet' && !m.includes('wallet')) return false;
        if (method === 'card' && !(m.includes('card') || m.includes('visa') || m.includes('bank'))) return false;
        if (method === 'cash' && !m.includes('cash')) return false;
      }
      if (status !== 'all') {
        if (status === 'refunded' && p.type !== 'refund') return false;
        if (status === 'cancelled' && p.status !== 'cancelled') return false;
        if (status === 'completed' && p.status !== 'completed') return false;
      }
      return true;
    });
  }, [payments, query, method, status]);

  const resetFilters = () => {
    setQuery(''); setStatus('all'); setVehicle('all'); setMethod('all');
    setDateFrom(''); setDateTo(''); setFiltersOpen(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="pasv-activity" aria-busy="true">
        <ActivityHeader />
        <div className="pasv-activity__body">
          <Skeleton variant="rect" height={96} radius="lg" />
          <Skeleton variant="rect" height={220} radius="md" />
          <Skeleton variant="rect" height={160} radius="md" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="pasv-activity">
        <ActivityHeader />
        <div className="pasv-activity__body">
          <ErrorState
            title="Gagal memuat aktivitas"
            description="Terjadi kesalahan saat mengambil riwayat perjalanan dan pembayaran."
            action={<Button variant="primary" onClick={() => { setError(false); onRetry?.(); load(); }}>Coba lagi</Button>}
          />
        </div>
      </div>
    );
  }

  // ── Offline ──
  if (offline) {
    return (
      <div className="pasv-activity">
        <ActivityHeader />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden />
          <span className="pasv-conn__msg">Koneksi terputus. Tidak dapat memuat aktivitas.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); onRetry?.(); load(); }}>
            <Icon icon={RefreshCw} size="xs" /> Coba lagi
          </button>
        </div>
        <div className="pasv-activity__body">
          <EmptyState icon={WifiOff} title="Mode Offline" description="Riwayat perjalanan akan dimuat saat koneksi kembali." />
        </div>
      </div>
    );
  }

  const hasTrips = (trips && trips.length > 0);
  const hasPayments = (payments && payments.length > 0);

  return (
    <div className="pasv-activity">
      <ActivityHeader
        action={(
          <button
            type="button"
            className="pasv-ico-btn"
            aria-label="Segarkan aktivitas"
            aria-busy={refreshing}
            onClick={refresh}
          >
            <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
          </button>
        )}
      />

      <main className="pasv-activity__body" ref={containerRef} aria-busy={refreshing}>
        {pullDistance > 0 && (
          <div className="pasv-ptr" style={{ height: pullDistance }} role="status" aria-live="polite">
            <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
            <span>{refreshing ? 'Memperbarui…' : 'Tarik untuk menyegarkan'}</span>
          </div>
        )}

        {/* ONGOING TRIP */}
        {ongoing && (
          <section className="pasv-act__ongoing" aria-label="Perjalanan berlangsung">
            <div className="pasv-act__ongoing-head">
              <span className="pasv-act__live-dot" aria-hidden />
              <span>Perjalanan Berlangsung</span>
              <Badge tone="primary">{ongoing.statusLabel}</Badge>
            </div>
            <button type="button" className="pasv-act__ongoing-row" onClick={() => onOngoingTrip?.(ongoing)}>
              <span className="pasv-act__ongoing-ico"><Icon icon={Navigation} size="sm" /></span>
              <span className="pasv-act__ongoing-body">
                <span className="pasv-act__ongoing-route">{ongoing.pickup} → {ongoing.destination}</span>
                <span className="pasv-act__ongoing-sub">
                  {ongoing.vehicle}{ongoing.driverName ? ` · ${ongoing.driverName}` : ''}
                </span>
              </span>
              <Icon icon={ChevronRight} size="sm" />
            </button>
          </section>
        )}

        {/* SEARCH */}
        <section className="pasv-act__search" aria-label="Cari aktivitas">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={setQuery}
            placeholder="Cari tujuan, driver, atau pembayaran…"
            aria-label="Cari aktivitas"
          />
          <button
            type="button"
            className={`pasv-act__filter-btn ${filtersOpen || activeFilterCount ? 'is-active' : ''}`}
            aria-label="Buka filter"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Icon icon={SlidersHorizontal} size="sm" />
            <span>Filter</span>
            {activeFilterCount > 0 && <span className="pasv-act__filter-badge">{activeFilterCount}</span>}
          </button>
        </section>

        {/* QUICK FILTERS (chips) */}
        <QuickFilters
          status={status} setStatus={setStatus}
          vehicle={vehicle} setVehicle={setVehicle}
          method={method} setMethod={setMethod}
          onViewAll={() => onFilter?.()}
        />

        {/* EXPANDED FILTER PANEL (date range) */}
        {filtersOpen && (
          <section className="pasv-act__filters" aria-label="Filter lanjutan">
            <div className="pasv-act__filters-row">
              <label className="pasv-act__field">
                <Icon icon={CalendarRange} size="xs" />
                <span>Dari</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Tanggal dari" />
              </label>
              <label className="pasv-act__field">
                <Icon icon={CalendarRange} size="xs" />
                <span>Sampai</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Tanggal sampai" />
              </label>
            </div>
            <div className="pasv-act__filters-actions">
              <Button variant="ghost" size="sm" onClick={resetFilters}><Icon icon={X} size="xs" /> Reset</Button>
              <Button variant="primary" size="sm" onClick={() => setFiltersOpen(false)}>Terapkan</Button>
            </div>
          </section>
        )}

        {/* RECENT TRIPS */}
        <section className="pasv-act__card" aria-label="Perjalanan terbaru">
          <div className="pasv-act__card-head">
            <span><Icon icon={Clock} size="sm" /> Perjalanan Terbaru</span>
            <button type="button" className="pasv-act__link" onClick={() => onViewAllTrips?.()}>Lihat Semua</button>
          </div>

          {!hasTrips ? (
            <EmptyState icon={MapPin} title="Belum ada perjalanan" description="Riwayat perjalanan Anda akan muncul di sini." />
          ) : filteredTrips.length === 0 ? (
            <EmptyState icon={Filter} title="Tidak ada hasil" description="Coba ubah kata kunci atau filter." />
          ) : (
            <ul className="pasv-act__trips">
              {filteredTrips.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="pasv-act__trip"
                    onClick={() => onTripDetail?.(t)}
                    aria-label={`Perjalanan ${t.pickup} ke ${t.destination}, ${t.statusLabel}`}
                  >
                    <span className="pasv-act__trip-ico"><Icon icon={t.status === 'cancelled' ? Ban : Car} size="sm" /></span>
                    <span className="pasv-act__trip-body">
                      <span className="pasv-act__trip-route">
                        <Icon icon={MapPin} size="xs" className="pasv-act__mini" /> {t.pickup}
                        <Icon icon={Navigation} size="xs" className="pasv-act__mini" /> {t.destination}
                      </span>
                      <span className="pasv-act__trip-sub">
                        {fmtDate(t.date)} · {t.vehicle}{t.driverName ? ` · ${t.driverName}` : ''}
                        {t.rating != null && (
                          <span className="pasv-act__rate"><Icon icon={Star} size="xs" /> {t.rating}</span>
                        )}
                      </span>
                    </span>
                    <span className="pasv-act__trip-right">
                      <span className="pasv-act__trip-fare">{money(t.fare)}</span>
                      <Badge tone={t.statusTone}>{t.statusLabel}</Badge>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RECENT PAYMENTS */}
        <section className="pasv-act__card" aria-label="Pembayaran terbaru">
          <div className="pasv-act__card-head">
            <span><Icon icon={Wallet} size="sm" /> Pembayaran Terbaru</span>
            <button type="button" className="pasv-act__link" onClick={() => onViewAllPayments?.()}>Lihat Semua</button>
          </div>

          {!hasPayments ? (
            <EmptyState icon={CreditCard} title="Belum ada pembayaran" description="Transaksi pembayaran Anda akan muncul di sini." />
          ) : filteredPayments.length === 0 ? (
            <EmptyState icon={Filter} title="Tidak ada hasil" description="Coba ubah kata kunci atau filter." />
          ) : (
            <ul className="pasv-act__pays">
              {filteredPayments.map((p) => {
                const Ico = TX_ICON[p.type] || ArrowUpRight;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="pasv-act__pay"
                      onClick={() => onPaymentDetail?.(p)}
                      aria-label={`Pembayaran ${p.title}, ${p.status}`}
                    >
                      <span className="pasv-act__pay-ico"><Icon icon={Ico} size="sm" /></span>
                      <span className="pasv-act__pay-body">
                        <span className="pasv-act__pay-title">{p.title}</span>
                        <span className="pasv-act__pay-sub">{fmtDate(p.at)} · {p.method || '—'}</span>
                      </span>
                      <span className={`pasv-act__pay-amt ${p.amount < 0 ? 'is-neg' : 'is-pos'}`}>{signedAmt(p.amount)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* FAVORITE TRIPS */}
        {favorites && favorites.length > 0 && (
          <section className="pasv-act__card" aria-label="Perjalanan favorit">
            <div className="pasv-act__card-head">
              <span><Icon icon={Heart} size="sm" /> Favorit</span>
            </div>
            <ul className="pasv-act__favs">
              {favorites.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="pasv-act__fav"
                    onClick={() => onFavoriteTrip?.(f)}
                    aria-label={`Pesan ulang ${f.title}`}
                  >
                    <span className="pasv-act__fav-ico"><Icon icon={RotateCcw} size="sm" /></span>
                    <span className="pasv-act__fav-body">
                      <span className="pasv-act__fav-title">{f.title}</span>
                      <span className="pasv-act__fav-sub">{f.count} perjalanan</span>
                    </span>
                    <Icon icon={ChevronRight} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* HELP & REFUND SHORTCUT */}
        {onRefundSupport && (
          <button type="button" className="pasv-act__help-link" onClick={() => onRefundSupport?.()}>
            <Icon icon={LifeBuoy} size="sm" /> Bantuan &amp; Refund
            <Icon icon={ChevronRight} size="sm" />
          </button>
        )}
      </main>
    </div>
  );
}

function ActivityHeader({ action }) {
  return (
    <header className="pasv-act__bar">
      <h1 className="pasv-act__title">Aktivitas</h1>
      {action}
    </header>
  );
}

function QuickFilters({ status, setStatus, vehicle, setVehicle, method, setMethod, onViewAll }) {
  return (
    <section className="pasv-act__chips" aria-label="Filter cepat">
      <div className="pasv-act__chip-row" role="group" aria-label="Status">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pasv-act__chip ${status === s.id ? 'is-active' : ''}`}
            aria-pressed={status === s.id}
            onClick={() => setStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="pasv-act__chip-row" role="group" aria-label="Kendaraan">
        {VEHICLE_FILTERS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`pasv-act__chip ${vehicle === v.id ? 'is-active' : ''}`}
            aria-pressed={vehicle === v.id}
            onClick={() => setVehicle(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="pasv-act__chip-row" role="group" aria-label="Metode pembayaran">
        {METHOD_FILTERS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pasv-act__chip ${method === m.id ? 'is-active' : ''}`}
            aria-pressed={method === m.id}
            onClick={() => setMethod(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
