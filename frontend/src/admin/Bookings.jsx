import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  BookOpen, Search as SearchIcon, X, Filter, ChevronRight, MapPin, User, Truck,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, Calendar, Clock,
  RefreshCw, ArrowUpDown, Eye, Ban, CreditCard, DollarSign, Navigation,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'];
const STATUS_LABELS = {
  all: 'Semua', pending: 'Menunggu', confirmed: 'Dikonfirmasi', 'in-progress': 'Berlangsung',
  completed: 'Selesai', cancelled: 'Dibatalkan', refunded: 'Dikembalikan',
};
const STATUS_COLORS = {
  pending: 'neutral', confirmed: 'info', 'in-progress': 'warning',
  completed: 'success', cancelled: 'danger', refunded: 'neutral',
};

const PICKUPS = [
  'Jl. Merdeka No.1, Jakarta Pusat', 'Jl. Sudirman No.50, Jakarta Selatan',
  'Jl. Gatot Subroto, Jakarta Selatan', 'Jl. Thamrin, Jakarta Pusat',
  'Bandara Soekarno-Hatta', 'Stasiun Gambir', 'Terminal Kampung Rambutan',
  'Jl. Mangga Dua, Jakarta Utara', 'Jl. Asia Afrika, Bandung', 'Jl. Malioboro, Yogyakarta',
];
const DESTINATIONS = [
  'Jl. Kemang, Jakarta Selatan', 'BSD City, Tangerang',
  'Grand Indonesia, Jakarta Pusat', 'Kelapa Gading, Jakarta Utara',
  'Bekasi Timur', 'Depok Margonda', 'Taman Mini Indonesia Indah',
  'Pantai Indah Kapuk, Jakarta Utara', 'Ciwidey, Bandung', 'Monas, Jakarta Pusat',
];
const CUSTOMERS = ['Budi Santoso', 'Siti Rahmawati', 'Ahmad Fauzi', 'Dewi Lestari', 'Rudi Hermawan',
  'Ani Susanti', 'Bambang Wijaya', 'Citra Dewi', 'Doni Prasetyo', 'Eka Putri'];
const DRIVERS = ['Agus Prasetyo', 'Bayu Saputra', 'Candra Wijaya', 'Dimas Ardiansyah', 'Eko Prabowo',
  'Farhan Maulana', 'Gilang Ramadhan', 'Hardi Suharto', 'Irfan Nugroho', 'Jati Kusumo'];

const DEMO_BOOKINGS = Array.from({ length: 25 }, (_, i) => {
  const statuses = ['completed', 'completed', 'completed', 'completed', 'in-progress', 'completed',
    'completed', 'pending', 'completed', 'confirmed', 'cancelled', 'completed', 'completed',
    'completed', 'refunded', 'completed', 'completed', 'pending', 'in-progress', 'completed',
    'completed', 'cancelled', 'completed', 'pending', 'completed'];
  return {
    id: `bk_${3000 + i}`,
    customerName: CUSTOMERS[i % 10],
    driverName: i % 2 === 0 ? DRIVERS[i % 10] : null,
    pickup: PICKUPS[i % 10],
    destination: DESTINATIONS[(i + 5) % 10],
    status: statuses[i],
    fare: Math.floor(20000 + Math.random() * 200000),
    distance: parseFloat((2 + Math.random() * 30).toFixed(1)),
    duration: Math.floor(10 + Math.random() * 60),
    date: new Date(Date.now() - Math.random() * 14 * 86400e3).toISOString(),
    paymentMethod: ['tunai', 'kartu', 'dompet', 'transfer'][i % 4],
    rating: Math.random() > 0.3 ? parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : null,
  };
});

export default function Bookings({ onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [actionBusy, setActionBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const d = await api.bookings();
      setBookings(Array.isArray(d) ? d : (d.data ?? DEMO_BOOKINGS));
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.id.toLowerCase().includes(q) ||
        (b.customerName || '').toLowerCase().includes(q) ||
        (b.driverName || '').toLowerCase().includes(q) ||
        (b.pickup || '').toLowerCase().includes(q) ||
        (b.destination || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((b) => b.status === statusFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [bookings, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleCancel = async (booking) => {
    setActionBusy(booking.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
      setToast({ variant: 'success', message: `Booking ${booking.id} dibatalkan` });
    } catch { setToast({ variant: 'error', message: 'Gagal membatalkan booking' }); }
    finally { setActionBusy(null); }
  };

  const SortHeader = ({ field, label }) => (
    <th className="admin-cust__th" onClick={() => toggleSort(field)}>
      {label}
      <ArrowUpDown size={12} className={`admin-cust__sort ${sortField === field ? 'admin-cust__sort--active' : ''}`}
        style={{ transform: sortField === field && sortDir === 'desc' ? 'rotate(180deg)' : undefined }} />
    </th>
  );

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Skeleton variant="rect" height={36} width={240} radius="sm" />
          <Skeleton variant="rect" height={36} width={280} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return <ErrorState title="Gagal memuat data booking" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Booking ({filtered.length})</h2>
        <button type="button" className="admin-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      <div className="admin-cust__toolbar">
        <div className="admin-cust__search">
          <SearchIcon size={16} className="admin-cust__search-icon" />
          <input
            className="admin-cust__search-input"
            type="text"
            placeholder="Cari ID, pelanggan, driver, atau rute..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari booking"
          />
          {search && (
            <button className="admin-cust__search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="admin-cust__filters">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`admin-cust__filter-btn${statusFilter === s ? ' admin-cust__filter-btn--active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="admin-cust__table-wrap">
          <table className="admin-cust__table">
            <thead>
              <tr>
                <th className="admin-cust__th">ID Booking</th>
                <th className="admin-cust__th">Pelanggan</th>
                <th className="admin-cust__th">Driver</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="fare" label="Tarif" />
                <SortHeader field="date" label="Tanggal" />
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada booking.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((booking) => (
                  <tr key={booking.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <div style={{ background: 'var(--ds-color-primary-soft, #eef2ff)', borderRadius: 8, padding: '6px 8px', display: 'grid', placeItems: 'center' }}>
                          <BookOpen size={14} style={{ color: 'var(--ds-color-primary, #4f46e5)' }} />
                        </div>
                        <div>
                          <div className="admin-cust__name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{booking.id}</div>
                          <div className="admin-cust__id" style={{ fontSize: 11 }}>
                            {booking.pickup.slice(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><User size={11} /> {booking.customerName || '-'}</div>
                      </div>
                    </td>
                    <td>
                      {booking.driverName ? (
                        <div className="admin-cust__contact">
                          <div><Truck size={11} /> {booking.driverName}</div>
                        </div>
                      ) : (
                        <span className="admin-cust__verif-none">—</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={STATUS_COLORS[booking.status] || 'neutral'} size="sm">
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </td>
                    <td className="admin-cust__num">Rp {booking.fare.toLocaleString('id-ID')}</td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('bookingDetail', booking.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('bookingTrips', booking.id)} title="Lihat Rute">
                          <Navigation size={14} />
                        </button>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button className="admin-cust__act-btn admin-cust__act-btn--danger" onClick={() => handleCancel(booking)}
                            disabled={actionBusy === booking.id} title="Batalkan">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} onChange={setPage} />
      )}

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
