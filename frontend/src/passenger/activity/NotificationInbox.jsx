import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Badge, Icon, Skeleton, EmptyState, ErrorState, Button,
} from '../../design-system/index.js';
import {
  Bell, Headphones, Car, MapPin, CreditCard, Wallet, Tag, Cpu, MessageCircle, ShieldAlert,
  Circle, Trash2, CheckCheck, RefreshCw, AlertTriangle, WifiOff, Settings,
  List, CheckSquare, Square, X, ExternalLink,
} from 'lucide-react';
import * as papi from '../api.js';
import {
  subscribe as subscribeNotifications, markRead, markAllRead, deleteNotification,
  markBulkRead, deleteBulkNotifications, setNotifications,
} from '../communication/notificationStore.js';
import './notificationInbox.css';

const CATEGORIES = {
  support:    { label: 'Bantuan',   icon: Headphones,  tone: 'info' },
  booking:    { label: 'Pesanan',   icon: Car,         tone: 'primary' },
  trip:       { label: 'Perjalanan', icon: MapPin,     tone: 'primary' },
  payment:    { label: 'Pembayaran', icon: CreditCard, tone: 'success' },
  wallet:     { label: 'Dompet',    icon: Wallet,      tone: 'success' },
  promotion:  { label: 'Promo',     icon: Tag,         tone: 'warning' },
  system:     { label: 'Sistem',    icon: Cpu,         tone: 'neutral' },
  chat:       { label: 'Chat',      icon: MessageCircle, tone: 'info' },
  security:   { label: 'Keamanan',  icon: ShieldAlert, tone: 'danger' },
};
const fallbackCat = { label: 'Lainnya', icon: Bell, tone: 'neutral' };

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'unread', label: 'Belum dibaca' },
  ...Object.entries(CATEGORIES)
    .filter(([key]) => key !== 'system')
    .map(([key, val]) => ({ id: key, label: val.label })),
  { id: 'system', label: 'Sistem' },
];

const GROUP_LABELS = { unread: 'Belum Dibaca', today: 'Hari Ini', yesterday: 'Kemarin', earlier: 'Sebelumnya' };

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function dayDiff(ts) {
  const a = startOfDay(new Date());
  const b = startOfDay(new Date(ts));
  return Math.round((a - b) / 86400000);
}
function relTime(ts) {
  const mins = Math.round((Date.now() - new Date(ts)) / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const dys = Math.round(hrs / 24);
  return `${dys} hari lalu`;
}

const ACTION_LABELS = {
  trip: 'Buka Perjalanan',
  promotion: 'Lihat Promo',
  wallet: 'Buka Dompet',
  payment: 'Lihat Pembayaran',
  chat: 'Buka Chat',
  support: 'Hubungi Bantuan',
  booking: 'Lihat Pesanan',
  security: 'Periksa',
};

function getActionLabel(n) {
  const t = n?.data?.type;
  return t && ACTION_LABELS[t] ? ACTION_LABELS[t] : null;
}

const NotificationRow = React.memo(function NotificationRow({
  n, cat, bulkMode, isSelected, onToggle, onOpen, onDelete, onMarkRead,
}) {
  const contentRef = useRef(null);
  const touchRef = useRef(null);
  const actionLabel = getActionLabel(n);

  const handleTouchStart = (e) => {
    if (bulkMode) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    if (!touchRef.current || bulkMode) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && contentRef.current) {
      contentRef.current.style.transform = `translateX(${Math.max(-160, Math.min(0, dx))}px)`;
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current || !contentRef.current || bulkMode) {
      touchRef.current = null;
      return;
    }
    touchRef.current = null;
    const m = contentRef.current.style.transform.match(/translateX\(([-\d.]+)px\)/);
    const endX = m ? parseFloat(m[1]) : 0;
    contentRef.current.style.transition = 'transform 200ms ease';
    if (endX < -120) {
      onDelete(null, n);
    } else if (endX < -50) {
      onMarkRead(null, n);
    }
    contentRef.current.style.transform = '';
  };

  return (
    <li className="pasv-ni__li">
      <div className="pasv-ni__swipe-actions" aria-hidden="true">
        <span className="pasv-ni__swipe-btn pasv-ni__swipe-btn--read"><CheckCheck size={18} /> Baca</span>
        <span className="pasv-ni__swipe-btn pasv-ni__swipe-btn--delete"><Trash2 size={18} /> Hapus</span>
      </div>
      <div
        ref={contentRef}
        className={`pasv-ni__row${n.unread ? ' is-unread' : ''}${n.priority === 'high' ? ' is-priority' : ''}${bulkMode ? ' has-checkbox' : ''}`}
        role={bulkMode ? undefined : 'button'}
        tabIndex={bulkMode ? undefined : 0}
        onClick={() => bulkMode ? onToggle(n.id) : onOpen(n)}
        onKeyDown={(e) => { if (!bulkMode && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(n); } }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label={bulkMode ? undefined : `${n.unread ? 'Belum dibaca. ' : ''}${cat.label}. ${n.title}. ${n.message}`}
      >
        {bulkMode && (
          <span className="pasv-ni__row-check" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={isSelected} onChange={() => onToggle(n.id)} aria-label={`Pilih ${n.title}`} />
          </span>
        )}
        <span className={`pasv-ni__ico pasv-ni__ico--${cat.tone}`}>
          <Icon icon={cat.icon} size="sm" />
        </span>
        <span className="pasv-ni__row-body">
          <span className="pasv-ni__row-top">
            <span className="pasv-ni__row-title">{n.title}</span>
            {n.unread && <span className="pasv-ni__unread-dot" aria-label="Belum dibaca" />}
          </span>
          <span className="pasv-ni__row-msg">{n.message}</span>
          <span className="pasv-ni__row-meta">
            <Badge tone={cat.tone}>{cat.label}</Badge>
            {n.priority === 'high' && <Badge tone="danger">Penting</Badge>}
            <span className="pasv-ni__time">{relTime(n.timestamp)}</span>
          </span>
          {actionLabel && !bulkMode && (
            <span className="pasv-ni__row-action">
              <button
                type="button"
                className="pasv-ni__action-btn"
                onClick={(e) => { e.stopPropagation(); onOpen(n); }}
                aria-label={actionLabel}
              >
                <ExternalLink size={14} />
                <span>{actionLabel}</span>
              </button>
            </span>
          )}
        </span>
      </div>
    </li>
  );
});

export default function NotificationInbox({ onOpen, onPreferences } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const bodyRef = useRef(null);
  const pullTouchRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true); setError(false);
    papi.getNotifications()
      .then((list) => {
        setNotifications(list.map((n) => ({ ...n })));
        setItems(list.map((n) => ({ ...n })));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const off = subscribeNotifications((list) => setItems(list.map((n) => ({ ...n }))));
    return off;
  }, []);

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'unread') return items.filter((n) => n.unread);
    return items.filter((n) => n.category === activeFilter);
  }, [items, activeFilter]);

  const groups = useMemo(() => {
    const unread = [];
    const today = [];
    const yesterday = [];
    const earlier = [];
    for (const n of filtered) {
      const diff = dayDiff(n.timestamp);
      if (n.unread) unread.push(n);
      else if (diff <= 0) today.push(n);
      else if (diff === 1) yesterday.push(n);
      else earlier.push(n);
    }
    const order = [
      { key: 'unread', items: unread },
      { key: 'today', items: today },
      { key: 'yesterday', items: yesterday },
      { key: 'earlier', items: earlier },
    ];
    return order.filter((g) => g.items.length > 0);
  }, [filtered]);

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const handleOpen = useCallback((n) => {
    markRead(n.id);
    onOpen?.(n);
  }, [onOpen]);

  const handleMarkRead = useCallback((e, n) => { e?.stopPropagation(); markRead(n.id); }, []);
  const handleDelete = useCallback((e, n) => { e?.stopPropagation(); deleteNotification(n.id); }, []);

  const handleBulkToggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleBulkSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((n) => n.id));
    });
  }, [filtered]);

  const handleBulkRead = useCallback(() => {
    markBulkRead([...selectedIds]);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkDelete = useCallback(() => {
    deleteBulkNotifications([...selectedIds]);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const toggleBulkMode = useCallback(() => {
    setBulkMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  const handleFilterSelect = useCallback((id) => {
    setActiveFilter(id);
    setSelectedIds(new Set());
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    papi.getNotifications()
      .then((list) => {
        setNotifications(list.map((n) => ({ ...n })));
        setItems(list.map((n) => ({ ...n })));
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, []);

  const handleBodyTouchStart = useCallback((e) => {
    if (bodyRef.current && bodyRef.current.scrollTop === 0) {
      pullTouchRef.current = { y: e.touches[0].clientY };
    }
  }, []);

  const handleBodyTouchMove = useCallback((e) => {
    if (!pullTouchRef.current || !bodyRef.current) return;
    const dy = e.touches[0].clientY - pullTouchRef.current.y;
    if (dy > 0 && bodyRef.current.scrollTop === 0) {
      bodyRef.current.style.transform = `translateY(${Math.min(60, dy * 0.4)}px)`;
      bodyRef.current.style.transition = 'none';
    }
  }, []);

  const handleBodyTouchEnd = useCallback(() => {
    if (!pullTouchRef.current || !bodyRef.current) {
      pullTouchRef.current = null;
      return;
    }
    pullTouchRef.current = null;
    bodyRef.current.style.transition = 'transform 200ms ease';
    bodyRef.current.style.transform = '';
    const m = bodyRef.current.style.transform.match(/translateY\(([\d.]+)px\)/);
    const dy = m ? parseFloat(m[1]) : 0;
    if (dy > 40) {
      handleRefresh();
    }
  }, [handleRefresh]);

  if (loading) {
    return (
      <div className="pasv-ni">
        <header className="pasv-ni__bar">
          <h1 className="pasv-ni__title">Notifikasi</h1>
        </header>
        <div className="pasv-ni__body">
          {[0, 1, 2, 3].map((i) => (
            <div className="pasv-ni__row" key={i}>
              <Skeleton variant="rounded" width={44} height={44} />
              <div className="pasv-ni__row-body">
                <Skeleton variant="text" height={14} width="60%" />
                <Skeleton variant="text" height={12} width="85%" />
                <Skeleton variant="text" height={10} width="40%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-ni">
        <header className="pasv-ni__bar">
          <h1 className="pasv-ni__title">Notifikasi</h1>
        </header>
        <div className="pasv-ni__body">
          <ErrorState
            icon={AlertTriangle}
            title="Gagal memuat notifikasi"
            description="Periksa koneksi Anda dan coba lagi."
            action={<Button variant="primary" onClick={() => load()}>Coba lagi</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pasv-ni">
      <header className="pasv-ni__bar">
        <h1 className="pasv-ni__title">
          Notifikasi
          {unreadCount > 0 && <span className="pasv-ni__unread-badge">{unreadCount}</span>}
        </h1>
        <span className="pasv-ni__bar-spacer" />
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" leftIcon={CheckCheck} onClick={() => markAllRead()}>
            Tandai semua dibaca
          </Button>
        )}
        <button
          type="button"
          className={`pasv-ni__bulk-toggle${bulkMode ? ' is-active' : ''}`}
          onClick={toggleBulkMode}
          aria-label={bulkMode ? 'Tutup mode pilih' : 'Mode pilih'}
          aria-pressed={bulkMode}
        >
          <Icon icon={bulkMode ? X : List} size="sm" />
        </button>
        <button
          type="button"
          className="pasv-ni__settings-btn"
          onClick={onPreferences}
          aria-label="Pengaturan notifikasi"
        >
          <Icon icon={Settings} size="sm" />
        </button>
      </header>

      <div className="pasv-ni__filter" role="tablist" aria-label="Filter kategori notifikasi">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={activeFilter === f.id}
            className={`pasv-ni__filter-chip${activeFilter === f.id ? ' is-active' : ''}`}
            onClick={() => handleFilterSelect(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {offline && (
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <WifiOff size={16} /> <span className="pasv-conn__msg">Mode offline — menampilkan notifikasi tersimpan.</span>
        </div>
      )}

      <div
        className="pasv-ni__body"
        ref={bodyRef}
        onTouchStart={handleBodyTouchStart}
        onTouchMove={handleBodyTouchMove}
        onTouchEnd={handleBodyTouchEnd}
      >
        {refreshing && (
          <div className="pasv-ni__refresh" role="status" aria-live="polite">
            <RefreshCw size={16} className="pasv-ni__refresh-spin" />
            <span>Memuat ulang...</span>
          </div>
        )}

        {bulkMode && filtered.length > 0 && (
          <div className="pasv-ni__bulk-bar">
            <button
              type="button"
              className="pasv-ni__bulk-select-all"
              onClick={handleBulkSelectAll}
              aria-label={selectedIds.size === filtered.length ? 'Batalkan pilih semua' : 'Pilih semua'}
            >
              <Icon icon={selectedIds.size === filtered.length ? CheckSquare : Square} size="sm" />
              <span>{selectedIds.size === filtered.length ? 'Batalkan semua' : 'Pilih semua'}</span>
            </button>
            <span className="pasv-ni__bulk-count">{selectedIds.size > 0 ? `${selectedIds.size} dipilih` : ''}</span>
          </div>
        )}

        {groups.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={activeFilter === 'all' ? 'Belum ada notifikasi' : 'Tidak ada notifikasi'}
            description={activeFilter === 'all'
              ? 'Notifikasi dari perjalanan, promo, dan pembayaran akan muncul di sini.'
              : `Tidak ada notifikasi kategori ${CATEGORY_FILTERS.find((f) => f.id === activeFilter)?.label || ''}.`}
            action={activeFilter !== 'all' ? <Button variant="ghost" size="sm" leftIcon={RefreshCw} onClick={() => setActiveFilter('all')}>Lihat semua</Button> : undefined}
          />
        ) : (
          groups.map((g) => {
            const groupUnread = g.items.filter((n) => n.unread).length;
            const label = g.key === 'unread' && groupUnread > 0
              ? `${GROUP_LABELS[g.key]} (${groupUnread})`
              : GROUP_LABELS[g.key];
            return (
              <section key={g.key} className="pasv-ni__group" aria-label={label}>
                <h2 className="pasv-ni__group-title">{label}</h2>
                <ul className="pasv-ni__list">
                  {g.items.map((n) => {
                    const cat = CATEGORIES[n.category] || fallbackCat;
                    return (
                      <NotificationRow
                        key={n.id}
                        n={n}
                        cat={cat}
                        bulkMode={bulkMode}
                        isSelected={selectedIds.has(n.id)}
                        onToggle={handleBulkToggle}
                        onOpen={handleOpen}
                        onDelete={handleDelete}
                        onMarkRead={handleMarkRead}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>

      {bulkMode && selectedIds.size > 0 && (
        <div className="pasv-ni__bulk-actions" role="toolbar" aria-label="Aksi massal">
          <span className="pasv-ni__bulk-label">{selectedIds.size} notifikasi dipilih</span>
          <div className="pasv-ni__bulk-btns">
            <Button variant="outline" size="sm" leftIcon={CheckCheck} onClick={handleBulkRead}>Baca</Button>
            <Button variant="outline" size="sm" leftIcon={Trash2} onClick={handleBulkDelete}>Hapus</Button>
          </div>
        </div>
      )}
    </div>
  );
}
