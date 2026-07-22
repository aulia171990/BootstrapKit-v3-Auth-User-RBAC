import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Dialog, Search, Select, DatePicker,
} from '../../design-system/index.js';
import {
  ArrowUpRight, ArrowDownLeft, ArrowRightLeft, TrendingUp, Search as SearchIcon, Filter,
  RefreshCw, WifiOff, Download, ChevronDown, X, Wallet,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import './wallet.css';

const TX_ICON = { trip: ArrowUpRight, topup: ArrowDownLeft, cashback: TrendingUp, transfer: ArrowRightLeft };
const TX_TONE = { trip: 'danger', topup: 'success', cashback: 'success', transfer: 'primary' };
const STATUS_LABEL = { completed: 'Selesai', pending: 'Tertunda', failed: 'Gagal' };
const TYPE_LABEL = { trip: 'Perjalanan', topup: 'Top Up', cashback: 'Cashback', transfer: 'Transfer' };
const PAGE_SIZE = 8;

const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Hari ini';
  if (same(d, yest)) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * TransactionHistory (4B) — Passenger Wallet transaction list.
 *
 * REUSES (no duplicated business logic):
 *   - api.getTransactionHistory (paginated; search/status/type/date filtering)
 *   - formatIDR (shared Pricing Engine)
 *   - design-system Search / Select / DatePicker / Button / Icon / Badge /
 *     Skeleton / EmptyState / ErrorState / Dialog
 *   - .pasv-conn offline banner (reuse from trip.css)
 *
 * Features: infinite scroll (scroll + load-more fallback), search, filter
 * (status + type), date range, grouping by date, detail dialog with Export
 * Receipt shortcut, loading/empty/offline/error states. Accessibility:
 * aria-live results, large touch targets, keyboard-operable controls.
 */
export default function TransactionHistory({ onBack, onNext, onExportReceipt }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState(null);

  const listRef = useRef(null);
  const reqId = useRef(0);

  const load = useCallback(async (nextPage, replace) => {
    if (offline) { setLoading(false); return; }
    const id = ++reqId.current;
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(false);
    try {
      const res = await papi.getTransactionHistory({
        page: nextPage, pageSize: PAGE_SIZE, query, status, type, from, to,
      });
      if (id !== reqId.current) return; // stale response guard
      setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      setPage(res.page);
      setHasMore(res.hasMore);
      setTotal(res.total);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
    }
  }, [offline, query, status, type, from, to]);

  // Reload from page 1 whenever filters change (debounced search).
  useEffect(() => {
    const t = setTimeout(() => { setItems([]); load(1, true); }, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Offline detection.
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const onScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore || offline) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) load(page + 1, false);
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const tx of items) {
      const key = dayLabel(tx.at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    }
    return Array.from(map.entries());
  }, [items]);

  const fmtAmt = (n) => `${n < 0 ? '-' : '+'} ${formatIDR(Math.abs(n))}`;

  const exportReceipt = (tx) => {
    onExportReceipt?.(tx);
    try {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const text = buildReceipt(tx);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `receipt-${tx.id}.txt`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      }
    } catch { /* download unsupported in this environment */ }
  };

  const resetFilters = () => { setQuery(''); setStatus(''); setType(''); setFrom(''); setTo(''); };

  // ---- States ----
  if (loading) {
    return (
      <div className="pasv-hist" aria-busy="true">
        <HistHeader onBack={onBack} />
        <div className="pasv-hist__body">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rect" height={56} radius="md" />)}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="pasv-hist">
        <HistHeader onBack={onBack} />
        <div className="pasv-hist__body">
          <ErrorState title="Gagal memuat riwayat" description="Terjadi kesalahan saat mengambil transaksi." action={<Button variant="primary" onClick={() => load(1, true)}>Coba lagi</Button>} />
        </div>
      </div>
    );
  }
  if (offline) {
    return (
      <div className="pasv-hist">
        <HistHeader onBack={onBack} />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden />
          <span className="pasv-conn__msg">Koneksi terputus. Tidak dapat memuat riwayat.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); load(1, true); }}><Icon icon={RefreshCw} size="xs" /> Coba lagi</button>
        </div>
        <div className="pasv-hist__body"><EmptyState icon={WifiOff} title="Mode Offline" description="Riwayat akan dimuat saat koneksi kembali." /></div>
      </div>
    );
  }

  const filtersActive = query || status || type || from || to;

  return (
    <div className="pasv-hist">
      <HistHeader onBack={onBack} />

      <div className="pasv-hist__filters">
        <Search placeholder="Cari transaksi…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Cari transaksi" />
        <div className="pasv-hist__filter-row">
          <Select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}
            options={[{ value: '', label: 'Semua status' }, { value: 'completed', label: STATUS_LABEL.completed }, { value: 'pending', label: STATUS_LABEL.pending }, { value: 'failed', label: STATUS_LABEL.failed }]} />
          <Select aria-label="Filter tipe" value={type} onChange={(e) => setType(e.target.value)}
            options={[{ value: '', label: 'Semua tipe' }, { value: 'trip', label: TYPE_LABEL.trip }, { value: 'topup', label: TYPE_LABEL.topup }, { value: 'cashback', label: TYPE_LABEL.cashback }, { value: 'transfer', label: TYPE_LABEL.transfer }]} />
        </div>
        <div className="pasv-hist__filter-row">
          <DatePicker aria-label="Dari tanggal" value={from} onChange={(e) => setFrom(e.target.value)} />
          <DatePicker aria-label="Sampai tanggal" value={to} onChange={(e) => setTo(e.target.value)} />
          {filtersActive && <Button variant="ghost" onClick={resetFilters} aria-label="Reset filter"><Icon icon={X} size="xs" /> Reset</Button>}
        </div>
      </div>

      <p className="pasv-hist__count" role="status" aria-live="polite">{total} transaksi</p>

      {items.length === 0 ? (
        <div className="pasv-hist__body"><EmptyState icon={Wallet} title="Tidak ada transaksi" description="Coba ubah pencarian atau filter." /></div>
      ) : (
        <div className="pasv-hist__list" ref={listRef} onScroll={onScroll}>
          {grouped.map(([label, txs]) => (
            <section key={label} className="pasv-hist__group" aria-label={label}>
              <h2 className="pasv-hist__group-lbl">{label}</h2>
              <ul className="pasv-hist__ul">
                {txs.map((t) => {
                  const Ico = TX_ICON[t.type] || ArrowRightLeft;
                  return (
                    <li key={t.id}>
                      <button type="button" className="pasv-hist__row" onClick={() => setDetail(t)} aria-label={`Detail ${t.title}`}>
                        <span className={`pasv-hist__row-ico pasv-hist__row-ico--${TX_TONE[t.type] || 'primary'}`}><Icon icon={Ico} size="sm" /></span>
                        <span className="pasv-hist__row-main">
                          <span className="pasv-hist__row-title">{t.title}</span>
                          <span className="pasv-hist__row-sub">{new Date(t.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · {STATUS_LABEL[t.status] || t.status}</span>
                        </span>
                        <span className={`pasv-hist__row-amt pasv-hist__row-amt--${t.amount < 0 ? 'neg' : 'pos'}`}>{fmtAmt(t.amount)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {loadingMore && <div className="pasv-hist__more"><SpinnerInline /></div>}
          {hasMore && !loadingMore && (
            <button type="button" className="pasv-hist__loadmore" onClick={() => load(page + 1, false)}>
              <Icon icon={ChevronDown} size="sm" /> Muat lebih banyak
            </button>
          )}
          {!hasMore && <p className="pasv-hist__end">— Akhir riwayat —</p>}
        </div>
      )}
      {onNext && <Button variant="outline" className="pasv-hist__next" onClick={onNext}>Lanjut</Button>}

      {detail && (
        <Dialog open onClose={() => setDetail(null)} title="Detail Transaksi" aria-label="Detail transaksi">
          <div className="pasv-hist__detail">
            <p className="pasv-hist__detail-title">{detail.title}</p>
            <p className={`pasv-hist__detail-amt pasv-hist__detail-amt--${detail.amount < 0 ? 'neg' : 'pos'}`}>{fmtAmt(detail.amount)}</p>
            <dl className="pasv-hist__detail-dl">
              <div><dt>Status</dt><dd><Badge tone={detail.status === 'failed' ? 'danger' : detail.status === 'pending' ? 'warning' : 'success'}>{STATUS_LABEL[detail.status] || detail.status}</Badge></dd></div>
              <div><dt>Tipe</dt><dd>{TYPE_LABEL[detail.type] || detail.type}</dd></div>
              <div><dt>Waktu</dt><dd>{new Date(detail.at).toLocaleString('id-ID')}</dd></div>
              <div><dt>ID</dt><dd>{detail.id}</dd></div>
            </dl>
            <div className="pasv-hist__detail-actions">
              <Button variant="primary" onClick={() => exportReceipt(detail)}><Icon icon={Download} size="sm" /> Ekspor Struk</Button>
              {onNext && <Button variant="outline" onClick={() => { setDetail(null); onNext(); }}>Lanjut</Button>}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function HistHeader({ onBack }) {
  return (
    <header className="pasv-hist__bar">
      <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={X} size="sm" /></button>
      <h1 className="pasv-hist__title">Riwayat Transaksi</h1>
      <span className="pasv-hist__bar-spacer" />
    </header>
  );
}

function SpinnerInline() {
  return <span className="pasv-hist__spin" aria-label="Memuat"><RefreshCw size={16} className="pasv-trip__spin" /></span>;
}

function buildReceipt(tx) {
  return [
    'OJOL — Struk Transaksi',
    '------------------------',
    `ID      : ${tx.id}`,
    `Tipe    : ${TYPE_LABEL[tx.type] || tx.type}`,
    `Detail  : ${tx.title}`,
    `Jumlah  : ${formatIDR(Math.abs(tx.amount))} (${tx.amount < 0 ? 'Keluar' : 'Masuk'})`,
    `Status  : ${STATUS_LABEL[tx.status] || tx.status}`,
    `Waktu   : ${new Date(tx.at).toLocaleString('id-ID')}`,
  ].join('\n');
}
