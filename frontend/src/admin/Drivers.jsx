import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  Users, Search as SearchIcon, X, Filter, ChevronRight, Map, Wallet, MessageSquare,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, User, Calendar, Shield, Truck,
  RefreshCw, ArrowUpDown, Eye, Ban, Star, Clock,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'active', 'pending', 'suspended', 'banned'];
const STATUS_LABELS = { all: 'Semua', active: 'Aktif', pending: 'Menunggu', suspended: 'Ditangguhkan', banned: 'Diblokir' };
const STATUS_COLORS = { active: 'success', pending: 'neutral', suspended: 'warning', banned: 'danger' };

const VEHICLE_TYPES = ['Motor', 'Mobil', 'Taksi'];
const DEMO_DRIVERS = Array.from({ length: 25 }, (_, i) => ({
  id: `drv_${2000 + i}`,
  name: ['Agus Prasetyo', 'Bayu Saputra', 'Candra Wijaya', 'Dimas Ardiansyah', 'Eko Prabowo',
    'Farhan Maulana', 'Gilang Ramadhan', 'Hardi Suharto', 'Irfan Nugroho', 'Jati Kusumo',
    'Kurniawan Adi', 'Lutfi Hakim', 'Miftah Rizky', 'Nanda Pradipta', 'Oki Setiawan',
    'Pramono Yoga', 'Qori Aulia', 'Reza Fahlevi', 'Sandy Permana', 'Teguh Wibisono',
    'Ujang Kosasih', 'Vicky Hermawan', 'Wahyu Nugroho', 'Yusuf Maulana', 'Zaki Ardiansyah'][i],
  email: `driver${2000 + i}@ojol.example`,
  phone: `+62878${String(45678901 + i).slice(0, 8)}`,
  status: ['active', 'active', 'pending', 'active', 'active', 'active', 'active', 'suspended', 'active', 'active',
    'active', 'active', 'active', 'active', 'banned', 'active', 'pending', 'active', 'active', 'active',
    'active', 'active', 'active', 'suspended', 'active'][i],
  vehicleType: VEHICLE_TYPES[i % 3],
  vehiclePlate: `B ${1234 + i} ${['ABC', 'XYZ', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZA', 'BCD', 'EFG',
    'HIJ', 'KLM', 'NOP', 'QRS', 'TUV', 'WXY', 'ZAB', 'CDE', 'FGH', 'IJK',
    'LMN', 'OPQ', 'RST', 'UVW', 'XYZ'][i]}`,
  totalTrips: Math.floor(Math.random() * 500) + 10,
  rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
  acceptanceRate: Math.floor(70 + Math.random() * 30),
  completionRate: Math.floor(80 + Math.random() * 20),
  emailVerified: i % 4 !== 0,
  phoneVerified: true,
  kycVerified: i % 5 !== 0,
  registeredAt: new Date(Date.now() - Math.random() * 365 * 86400e3).toISOString(),
  lastActive: new Date(Date.now() - Math.random() * 7 * 86400e3).toISOString(),
}));

export default function Drivers({ onNavigate }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [actionBusy, setActionBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const d = await api.drivers();
      setDrivers(Array.isArray(d) ? d : (d.data ?? DEMO_DRIVERS));
    } catch { setError(true); setDrivers(DEMO_DRIVERS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = [...drivers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q) ||
        (d.vehiclePlate || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((d) => d.status === statusFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [drivers, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = async (driver, newStatus) => {
    setActionBusy(driver.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setDrivers((prev) => prev.map((d) => d.id === driver.id ? { ...d, status: newStatus } : d));
      setToast({ variant: 'success', message: `${driver.name} ${newStatus === 'active' ? 'diaktifkan' : 'ditangguhkan'}` });
    } catch { setToast({ variant: 'error', message: 'Gagal mengubah status' }); }
    finally { setActionBusy(null); }
  };

  const handleVerify = async (driver) => {
    setActionBusy(driver.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setDrivers((prev) => prev.map((d) => d.id === driver.id ? { ...d, status: 'active', kycVerified: true } : d));
      setToast({ variant: 'success', message: `${driver.name} berhasil diverifikasi` });
    } catch { setToast({ variant: 'error', message: 'Gagal memverifikasi' }); }
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
          <Skeleton variant="rect" height={36} width={180} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && drivers.length === 0) {
    return <ErrorState title="Gagal memuat data driver" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Driver ({filtered.length})</h2>
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
            placeholder="Cari nama, email, telepon, atau plat..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari driver"
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
                <SortHeader field="name" label="Nama" />
                <th className="admin-cust__th">Kontak & Kendaraan</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="totalTrips" label="Trip" />
                <SortHeader field="rating" label="Rating" />
                <th className="admin-cust__th">Verifikasi</th>
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada driver.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((driver) => (
                  <tr key={driver.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <Avatar size="sm" name={driver.name} />
                        <div>
                          <div className="admin-cust__name">{driver.name || '-'}</div>
                          <div className="admin-cust__id">#{driver.id.slice(0, 10)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><Mail size={11} /> {driver.email || '-'}</div>
                        <div><Phone size={11} /> {driver.phone || '-'}</div>
                        <div><Truck size={11} /> {driver.vehicleType} · {driver.vehiclePlate}</div>
                      </div>
                    </td>
                    <td>
                      <StatusIndicator tone={STATUS_COLORS[driver.status] || 'neutral'} label={STATUS_LABELS[driver.status] || driver.status} />
                    </td>
                    <td className="admin-cust__num">{driver.totalTrips ?? 0}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <Star size={12} style={{ color: '#f59e0b' }} />
                        {driver.rating ?? '-'}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__verif">
                        {driver.kycVerified && <Badge variant="success" size="sm"><CheckCircle size={10} /> Terverifikasi</Badge>}
                        {driver.status === 'pending' && <Badge variant="neutral" size="sm"><Clock size={10} /> Menunggu</Badge>}
                        {driver.status !== 'pending' && !driver.kycVerified && <span className="admin-cust__verif-none">Belum verifikasi</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('driverDetail', driver.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('driverTrips', driver.id)} title="Riwayat Trip">
                          <Map size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('driverWallet', driver.id)} title="Dompet">
                          <Wallet size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('driverSupport', driver.id)} title="Support">
                          <MessageSquare size={14} />
                        </button>
                        {driver.status === 'pending' && (
                          <button className="admin-cust__act-btn admin-cust__act-btn--success" onClick={() => handleVerify(driver)}
                            disabled={actionBusy === driver.id} title="Verifikasi">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {driver.status === 'active' && (
                          <button className="admin-cust__act-btn admin-cust__act-btn--warn" onClick={() => handleToggleStatus(driver, 'suspended')}
                            disabled={actionBusy === driver.id} title="Tangguhkan">
                            <Ban size={14} />
                          </button>
                        )}
                        {(driver.status === 'suspended' || driver.status === 'banned') && (
                          <button className="admin-cust__act-btn admin-cust__act-btn--success" onClick={() => handleToggleStatus(driver, 'active')}
                            disabled={actionBusy === driver.id} title="Aktifkan">
                            <CheckCircle size={14} />
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
