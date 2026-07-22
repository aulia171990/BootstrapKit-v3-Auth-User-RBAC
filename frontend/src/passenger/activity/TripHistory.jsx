import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, SearchBar,
} from '../../design-system/index.js';
import {
  Clock, MapPin, Navigation, Car, Wallet, Star, Search, SlidersHorizontal,
  ChevronRight, ArrowUpRight, Ban, RotateCcw, Filter, X, ArrowDownUp,
  Heart, WifiOff, RefreshCw, TrendingUp, Bookmark, Receipt,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import { usePullToRefresh } from '../wallet/usePullToRefresh.js';
import './tripHistory.css';

const PAGE_SIZE = 8;

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
const PROMO_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'yes', label: 'Pakai Promo' },
  { id: 'no', label: 'Tanpa Promo' },
];
const SORTS = [
  { id: 'desc', label: 'Terbaru' },
  { id: 'asc', label: 'Terlama' },
  { id: 'fare_desc', label: 'Tarif Tertinggi' },
  { id: 'fare_asc', label: 'Tarif Terendah' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function money(n) { return formatIDR(Math.abs(n)); }

/**
 * TripHistory — Passenger Trip History (Sprint 5, 3E-5B).
 *
 * REUSES (no duplicated business logic):
 *   - papi.fetchTripsPage (API-first, real /trips + demo fallback) for
 *     paged, searchable, filterable, sortable trip history.
 *   - papi.groupTripsByMonth for month grouping.
 *   - papi.getFavoriteTrips for the Favorite Trips section.
 *   - formatIDR (Pricing Engine) for currency.
 *   - design-system: Button / Icon / Badge / Skeleton / EmptyState / ErrorState /
 *     SearchBar. usePullToRefresh (wallet module).
 *
 * Features: Infinite scroll (IntersectionObserver) · Grouped by month · Search
 * (pickup/destination/driver) · Filter (status/vehicle/method/date) · Sort
 * (date/fare) · Favorite Trips. States: loading, empty, offline, error.
 */
export default function TripHistory({ onBack, onTripDetail, onFavoriteTrip, onSort, onRetry, onReceipt, onRepeat }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [vehicle, setVehicle] = useState('all');
  const [method, setMethod] = useState('all');
  const [driver, setDriver] = useState('');
  const [fareMin, setFareMin] = useState('');
  const [fareMax, setFareMax] = useState('');
  const [promoUsed, setPromoUsed] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (nextPage, replace) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(false);
    try {
      const res = await papi.fetchTripsPage({
        page: nextPage, pageSize: PAGE_SIZE, keywords: query, status, vehicle, method,
        driver, fareMin, fareMax, promoUsed, sort, from: dateFrom, to: dateTo,
      });
      setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      setTotal(res.total);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch {
      if (replace) setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [query, status, vehicle, method, driver, fareMin, fareMax, promoUsed, sort, dateFrom, dateTo]);

  // Reset + reload when filters/search/sort change.
  useEffect(() => {
    if (offline) { setLoading(false); return; }
    setItems([]); setPage(1); setHasMore(false);
    loadPage(1, true);
    if (query.trim()) setRecentSearches(papi.pushRecentTripSearch(query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, vehicle, method, driver, fareMin, fareMax, promoUsed, sort, dateFrom, dateTo, offline]);

  // Load favorites, saved filters, and recent searches once.
  useEffect(() => {
    papi.getFavoriteTrips().then(setFavorites).catch(() => setFavorites([]));
    setSavedFilters(papi.getSavedTripFilters());
    setRecentSearches(papi.getRecentTripSearches());
  }, []);

  // Infinite scroll: observe the sentinel.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore || loading) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadPage(page + 1, false);
    }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, page]);

  const refresh = () => { onRetry?.(); loadPage(1, true); };
  const { containerRef, pullDistance, refreshing } = usePullToRefresh(refresh);

  const groups = useMemo(() => {
    const sorted = [...items];
    if (sort === 'fare_desc') sorted.sort((a, b) => b.fare - a.fare);
    else if (sort === 'fare_asc') sorted.sort((a, b) => a.fare - b.fare);
    return papi.groupTripsByMonth(sorted);
  }, [items, sort]);

  const resetFilters = () => {
    setQuery(''); setStatus('all'); setVehicle('all'); setMethod('all');
    setDriver(''); setFareMin(''); setFareMax(''); setPromoUsed('all');
    setDateFrom(''); setDateTo(''); setFiltersOpen(false);
  };

  const captureFilters = () => ({
    query, status, vehicle, method, driver, fareMin, fareMax, promoUsed, dateFrom, dateTo, sort,
  });
  const applyFilters = (cfg) => {
    setQuery(cfg.query ?? ''); setStatus(cfg.status ?? 'all'); setVehicle(cfg.vehicle ?? 'all');
    setMethod(cfg.method ?? 'all'); setDriver(cfg.driver ?? ''); setFareMin(cfg.fareMin ?? '');
    setFareMax(cfg.fareMax ?? ''); setPromoUsed(cfg.promoUsed ?? 'all');
    setDateFrom(cfg.dateFrom ?? ''); setDateTo(cfg.dateTo ?? ''); setSort(cfg.sort ?? 'desc');
  };
  const onSaveFilter = () => {
    const name = (query || driver || status !== 'all' || vehicle !== 'all' || promoUsed !== 'all')
      ? (query || driver || status !== 'all' ? `${query || driver || status}${vehicle !== 'all' ? ' · ' + vehicle : ''}` : 'Filter')
      : 'Filter';
    setSavedFilters(papi.saveTripFilter(name, captureFilters()));
  };
  const onApplySaved = (cfg) => { applyFilters(cfg); setFiltersOpen(false); };
  const onDeleteSaved = (name) => setSavedFilters(papi.deleteSavedTripFilter(name));

  const f = {
    query, setQuery, status, setStatus, vehicle, setVehicle, method, setMethod,
    driver, setDriver, fareMin, setFareMin, fareMax, setFareMax, promoUsed, setPromoUsed,
    dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, filtersOpen, setFiltersOpen,
    resetFilters, onSaveFilter, savedFilters, recentSearches, onApplySaved, onDeleteSaved,
  };

  // ── Error (body only; toolbar/filters stay mounted) ──
  if (error) {
    return (
      <Shell
        f={f}
        onBack={onBack}
        favorites={favorites}
        onFavoriteTrip={onFavoriteTrip}
        refresh={refresh} refreshing={refreshing}
      >
        <ErrorState
          title="Gagal memuat riwayat"
          description="Terjadi kesalahan saat mengambil riwayat perjalanan."
          action={<Button variant="primary" onClick={() => { setError(false); onRetry?.(); loadPage(1, true); }}>Coba lagi</Button>}
        />
      </Shell>
    );
  }

  // ── Offline (body only; toolbar/filters stay mounted) ──
  if (offline) {
    return (
      <Shell
        f={f}
        onBack={onBack}
        favorites={favorites}
        onFavoriteTrip={onFavoriteTrip}
        refresh={refresh} refreshing={refreshing}
      >
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden />
          <span className="pasv-conn__msg">Koneksi terputus. Tidak dapat memuat riwayat.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); onRetry?.(); loadPage(1, true); }}>
            <Icon icon={RefreshCw} size="xs" /> Coba lagi
          </button>
        </div>
        <EmptyState icon={WifiOff} title="Mode Offline" description="Riwayat perjalanan akan dimuat saat koneksi kembali." />
      </Shell>
    );
  }

  return (
    <Shell
      f={f}
      onBack={onBack}
      favorites={favorites}
      onFavoriteTrip={onFavoriteTrip}
      refresh={refresh} refreshing={refreshing}
    >
      <main className="pasv-th__body" ref={containerRef} aria-busy={refreshing || loading || loadingMore}>
        {pullDistance > 0 && (
          <div className="pasv-ptr" style={{ height: pullDistance }} role="status" aria-live="polite">
            <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
            <span>{refreshing ? 'Memperbarui…' : 'Tarik untuk menyegarkan'}</span>
          </div>
        )}

        {loading && items.length === 0 ? (
          <>
            <Skeleton variant="rect" height={56} radius="lg" />
            <Skeleton variant="rect" height={400} radius="md" />
          </>
        ) : items.length === 0 ? (
          <EmptyState icon={MapPin} title="Belum ada perjalanan" description="Riwayat perjalanan Anda akan muncul di sini." />
        ) : (
          groups.map((g) => (
            <section key={g.key} className="pasv-th__group" aria-label={g.label}>
              <h2 className="pasv-th__month">{g.label}</h2>
              <ul className="pasv-th__list">
                {g.items.map((t) => (
                  <li key={t.id}>
                    <TripRow trip={t} onSelect={onTripDetail} onReceipt={onReceipt} onRepeat={onRepeat} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {loadingMore && <div className="pasv-th__more" role="status"><Icon icon={RefreshCw} size="sm" className="pasv-spin" /> Memuat lagi…</div>}
        {!hasMore && items.length > 0 && <div className="pasv-th__end">— Sudah mencapai akhir —</div>}
        {/* Infinite-scroll sentinel */}
        <div ref={sentinelRef} aria-hidden className="pasv-th__sentinel" />
      </main>
    </Shell>
  );
}

// Memoized row: re-renders only when its own trip identity changes, so toggling
// the filter panel / sort on the parent doesn't re-render the whole list (perf).
const TripRow = React.memo(function TripRow({ trip: t, onSelect, onReceipt, onRepeat }) {
  return (
    <div className="pasv-th__trip-card">
      <button
        type="button"
        className="pasv-th__trip"
        onClick={() => onSelect?.(t)}
        aria-label={`Perjalanan ${t.pickup} ke ${t.destination}, ${t.statusLabel}`}
      >
        <span className="pasv-th__trip-ico"><Icon icon={t.status === 'cancelled' ? Ban : Car} size="sm" /></span>
        <span className="pasv-th__trip-body">
          <span className="pasv-th__trip-route">
            <Icon icon={MapPin} size="xs" className="pasv-th__mini" /> {t.pickup}
            <Icon icon={Navigation} size="xs" className="pasv-th__mini" /> {t.destination}
          </span>
          <span className="pasv-th__trip-sub">
            {fmtDate(t.date)} · {t.vehicle}{t.driverName ? ` · ${t.driverName}` : ''}
            {t.rating != null && <span className="pasv-th__rate"><Icon icon={Star} size="xs" /> {t.rating}</span>}
          </span>
        </span>
        <span className="pasv-th__trip-right">
          <span className="pasv-th__trip-fare">{money(t.fare)}</span>
          <Badge tone={t.statusTone}>{t.statusLabel}</Badge>
        </span>
      </button>
      {(onReceipt || onRepeat) && (
        <div className="pasv-th__trip-actions">
          {onReceipt && (
            <button type="button" className="pasv-th__quick" onClick={() => onReceipt(t)} aria-label={`Lihat receipt perjalanan ${t.pickup} ke ${t.destination}`}>
              <Icon icon={Receipt} size="xs" /> Receipt
            </button>
          )}
          {onRepeat && (
            <button type="button" className="pasv-th__quick" onClick={() => onRepeat(t)} aria-label={`Pesan lagi perjalanan ${t.pickup} ke ${t.destination}`}>
              <Icon icon={RotateCcw} size="xs" /> Pesan Lagi
            </button>
          )}
        </div>
      )}
    </div>
  );
});

function THHeader({ onBack, action }) {
  return (
    <header className="pasv-th__bar">
      {onBack && (
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronRight} size="sm" style={{ transform: 'rotate(180deg)' }} /></button>
      )}
      <h1 className="pasv-th__title">Riwayat Perjalanan</h1>
      <span className="pasv-th__bar-spacer" />
      {action}
    </header>
  );
}

// Shared chrome: header + toolbar + (optional) filter panel + favorites.
function Shell({ f, onBack, favorites, onFavoriteTrip, refresh, refreshing, children }) {
  const {
    query, setQuery, status, setStatus, vehicle, setVehicle, method, setMethod,
    driver, setDriver, fareMin, setFareMin, fareMax, setFareMax, promoUsed, setPromoUsed,
    dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, filtersOpen, setFiltersOpen,
    resetFilters, onSaveFilter, savedFilters = [], recentSearches = [], onApplySaved, onDeleteSaved,
  } = f;
  return (
    <div className="pasv-th">
      <THHeader
        onBack={onBack}
        action={(
          <button type="button" className="pasv-ico-btn" aria-label="Segarkan" aria-busy={refreshing} onClick={refresh}>
            <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
          </button>
        )}
      />
      <div className="pasv-th__toolbar">
        <SearchBar value={query} onChange={setQuery} onSearch={setQuery} placeholder="Cari tujuan, driver…" aria-label="Cari perjalanan" />
        <button
          type="button"
          className={`pasv-th__filter-btn ${filtersOpen ? 'is-active' : ''}`}
          aria-label="Buka filter & urutkan"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Icon icon={SlidersHorizontal} size="sm" /><span>Filter</span>
        </button>
      </div>

      {filtersOpen && (
        <section className="pasv-th__filters" aria-label="Filter & urutkan">
          <div className="pasv-th__chip-row" role="group" aria-label="Status">
            {STATUS_FILTERS.map((s) => (
              <button key={s.id} type="button" className={`pasv-th__chip ${status === s.id ? 'is-active' : ''}`} aria-pressed={status === s.id} onClick={() => setStatus(s.id)}>{s.label}</button>
            ))}
          </div>
          <div className="pasv-th__chip-row" role="group" aria-label="Kendaraan">
            {VEHICLE_FILTERS.map((v) => (
              <button key={v.id} type="button" className={`pasv-th__chip ${vehicle === v.id ? 'is-active' : ''}`} aria-pressed={vehicle === v.id} onClick={() => setVehicle(v.id)}>{v.label}</button>
            ))}
          </div>
          <div className="pasv-th__chip-row" role="group" aria-label="Metode pembayaran">
            {METHOD_FILTERS.map((m) => (
              <button key={m.id} type="button" className={`pasv-th__chip ${method === m.id ? 'is-active' : ''}`} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>{m.label}</button>
            ))}
          </div>
          <div className="pasv-th__chip-row" role="group" aria-label="Promo">
            {PROMO_FILTERS.map((p) => (
              <button key={p.id} type="button" className={`pasv-th__chip ${promoUsed === p.id ? 'is-active' : ''}`} aria-pressed={promoUsed === p.id} onClick={() => setPromoUsed(p.id)}>{p.label}</button>
            ))}
          </div>

          <label className="pasv-th__field pasv-th__field--full">
            <Icon icon={Search} size="xs" /><span>Driver</span>
            <input type="text" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Nama driver" aria-label="Cari nama driver" />
          </label>

          <div className="pasv-th__filters-row">
            <label className="pasv-th__field"><Icon icon={TrendingUp} size="xs" /><span>Tarif min</span>
              <input type="number" value={fareMin} onChange={(e) => setFareMin(e.target.value)} placeholder="0" aria-label="Tarif minimum" /></label>
            <label className="pasv-th__field"><Icon icon={TrendingUp} size="xs" /><span>Tarif max</span>
              <input type="number" value={fareMax} onChange={(e) => setFareMax(e.target.value)} placeholder="∞" aria-label="Tarif maksimum" /></label>
          </div>

          <div className="pasv-th__filters-row">
            <label className="pasv-th__field"><Icon icon={Clock} size="xs" /><span>Dari</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Tanggal dari" /></label>
            <label className="pasv-th__field"><Icon icon={Clock} size="xs" /><span>Sampai</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Tanggal sampai" /></label>
          </div>

          <div className="pasv-th__sort">
            <Icon icon={ArrowDownUp} size="xs" />
            <span>Urutkan</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan berdasarkan">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="pasv-th__chips-block">
              <span className="pasv-th__chips-label">Pencarian terakhir</span>
              <div className="pasv-th__chip-row">
                {recentSearches.map((s) => (
                  <button key={s} type="button" className="pasv-th__chip pasv-th__chip--ghost" onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Saved filters */}
          <div className="pasv-th__chips-block">
            <span className="pasv-th__chips-label">Filter tersimpan</span>
            {savedFilters.length === 0 ? (
              <span className="pasv-th__muted">Belum ada filter tersimpan.</span>
            ) : (
              <div className="pasv-th__saved">
                {savedFilters.map((sf) => (
                  <span key={sf.name} className="pasv-th__saved-item">
                    <button type="button" className="pasv-th__chip pasv-th__chip--ghost" onClick={() => onApplySaved?.(sf.filter)}>{sf.name}</button>
                    <button type="button" className="pasv-th__saved-del" aria-label={`Hapus ${sf.name}`} onClick={() => onDeleteSaved?.(sf.name)}><Icon icon={X} size="xs" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pasv-th__filters-actions">
            <Button variant="ghost" size="sm" onClick={resetFilters}><Icon icon={X} size="xs" /> Reset</Button>
            <Button variant="outline" size="sm" onClick={onSaveFilter}><Icon icon={Bookmark} size="xs" /> Simpan</Button>
            <Button variant="primary" size="sm" onClick={() => setFiltersOpen(false)}>Terapkan</Button>
          </div>
        </section>
      )}

      {favorites && favorites.length > 0 && (
        <section className="pasv-th__favs" aria-label="Perjalanan favorit">
          <div className="pasv-th__section-head"><Icon icon={Heart} size="sm" /> Favorit</div>
          <ul className="pasv-th__fav-list">
            {favorites.map((fa) => (
              <li key={fa.id}>
                <button type="button" className="pasv-th__fav" onClick={() => onFavoriteTrip?.(fa)} aria-label={`Pesan ulang ${fa.title}`}>
                  <span className="pasv-th__fav-ico"><Icon icon={RotateCcw} size="sm" /></span>
                  <span className="pasv-th__fav-body">
                    <span className="pasv-th__fav-title">{fa.title}</span>
                    <span className="pasv-th__fav-sub">{fa.count} perjalanan</span>
                  </span>
                  <Icon icon={ChevronRight} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}
    </div>
  );
}
