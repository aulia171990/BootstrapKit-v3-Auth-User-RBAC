import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  Map, Search as SearchIcon, X, Filter, ChevronRight, MapPin, User, Truck,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, Calendar, Clock,
  RefreshCw, ArrowUpDown, Eye, Navigation, Star, DollarSign,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'in-progress', 'completed', 'cancelled'];
const STATUS_LABELS = {
  all: 'Semua', 'in-progress': 'Berlangsung', completed: 'Selesai', cancelled: 'Dibatalkan',
};
const STATUS_COLORS = {
  'in-progress': 'warning', completed: 'success', cancelled: 'danger',
};

const PICKUPS = [
  'Jl. Merdeka No.1, Jakarta Pusat', 'Jl. Sudirman No.50, Jakarta Selatan',
  'Jl. Gatot Subroto, Jakarta Selatan', 'Jl. Thamrin, Jakarta Pusat',
  'Bandara Soekarno-Hatta', 'Stasiun Gambir', 'Terminal Kampung Rambutan',
  'Jl. Mangga Dua, Jakarta Utara', 'Jl. Asia Afrika, Bandung',
];
const DESTINATIONS = [
  'Jl. Kemang, Jakarta Selatan', 'BSD City, Tangerang',
  'Grand Indonesia, Jakarta Pusat', 'Kelapa Gading, Jakarta Utara',
  'Bekasi Timur', 'Depok Margonda', 'Taman Mini Indonesia Indah',
  'Pantai Indah Kapuk, Jakarta Utara', 'Monas, Jakarta Pusat',
];
const CUSTOMERS = ['Budi Santoso', 'Siti Rahmawati', 'Ahmad Fauzi', 'Dewi Lestari', 'Rudi Hermawan',
  'Ani Susanti', 'Bambang Wijaya', 'Citra Dewi', 'Doni Prasetyo', 'Eka Putri'];
const DRIVERS = ['Agus Prasetyo', 'Bayu Saputra', 'Candra Wijaya', 'Dimas Ardiansyah', 'Eko Prabowo',
  'Farhan Maulana', 'Gilang Ramadhan', 'Hardi Suharto', 'Irfan Nugroho', 'Jati Kusumo'];

const DEMO_TRIPS = Array.from({ length: 25 }, (_, i) => ({
  id: `tr_${4000 + i}`,
  customerName: CUSTOMERS[i % 10],
  customerId: `usr_${1000 + (i % 10)}`,
  driverName: DRIVERS[(i + 3) % 10],
  driverId: `drv_${2000 + ((i + 3) % 10)}`,
  pickup: PICKUPS[i % 9],
  destination: DESTINATIONS[(i + 4) % 9],
  status: ['completed', 'completed', 'completed', 'in-progress', 'completed', 'completed',
    'completed', 'completed', 'cancelled', 'completed', 'completed', 'completed',
    'completed', 'in-progress', 'completed', 'completed', 'completed', 'cancelled',
    'completed', 'completed', 'completed', 'completed', 'in-progress', 'completed', 'completed'][i],
  fare: Math.floor(25000 + Math.random() * 250000),
  distance: parseFloat((1.5 + Math.random() * 35).toFixed(1)),
  duration: Math.floor(8 + Math.random() * 70),
  date: new Date(Date.now() - Math.random() * 30 * 86400e3).toISOString(),
  rating: Math.random() > 0.2 ? parseFloat((3.0 + Math.random() * 2.0).toFixed(1)) : null,
}));

export default function Trips({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const d = await api.trips();
      setTrips(Array.isArray(d) ? d : (d.data ?? DEMO_TRIPS));
    } catch { setError(true); setTrips(DEMO_TRIPS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = [...trips];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.driverName || '').toLowerCase().includes(q) ||
        (t.pickup || '').toLowerCase().includes(q) ||
        (t.destination || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [trips, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
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
          <Skeleton variant="rect" height={36} width={220} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && trips.length === 0) {
    return <ErrorState title="Gagal memuat data trip" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Trip ({filtered.length})</h2>
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
            aria-label="Cari trip"
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
                <th className="admin-cust__th">ID Trip</th>
                <th className="admin-cust__th">Pelanggan</th>
                <th className="admin-cust__th">Driver</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="fare" label="Tarif" />
                <SortHeader field="distance" label="Jarak" />
                <SortHeader field="date" label="Tanggal" />
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada trip.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((trip) => (
                  <tr key={trip.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <div style={{ background: 'var(--ds-color-success-soft, #f0fdf4)', borderRadius: 8, padding: '6px 8px', display: 'grid', placeItems: 'center' }}>
                          <Navigation size={14} style={{ color: 'var(--ds-color-success, #16a34a)' }} />
                        </div>
                        <div>
                          <div className="admin-cust__name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{trip.id}</div>
                          <div className="admin-cust__id" style={{ fontSize: 11 }}>
                            {trip.pickup.slice(0, 18)}…
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><User size={11} /> {trip.customerName || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><Truck size={11} /> {trip.driverName || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={STATUS_COLORS[trip.status] || 'neutral'} size="sm">
                        {STATUS_LABELS[trip.status] || trip.status}
                      </Badge>
                    </td>
                    <td className="admin-cust__num">Rp {trip.fare.toLocaleString('id-ID')}</td>
                    <td className="admin-cust__num">{trip.distance} km</td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(trip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('tripDetail', trip.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('tripRoute', trip.id)} title="Lihat Rute">
                          <Map size={14} />
                        </button>
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
    </div>
  );
}
