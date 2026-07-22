import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  Users, Search as SearchIcon, X, Filter, ChevronRight, Map, Wallet, MessageSquare,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, User, Calendar, Shield,
  RefreshCw, ArrowUpDown, Eye, Ban,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'active', 'suspended', 'banned'];
const STATUS_LABELS = { all: 'Semua', active: 'Aktif', suspended: 'Ditangguhkan', banned: 'Diblokir' };
const STATUS_COLORS = { active: 'success', suspended: 'warning', banned: 'danger' };

const DEMO_CUSTOMERS = Array.from({ length: 25 }, (_, i) => ({
  id: `usr_${1000 + i}`,
  name: ['Budi Santoso', 'Siti Rahmawati', 'Ahmad Fauzi', 'Dewi Lestari', 'Rudi Hermawan',
    'Ani Susanti', 'Bambang Wijaya', 'Citra Dewi', 'Doni Prasetyo', 'Eka Putri',
    'Fajar Hidayat', 'Gita Permata', 'Hendra Gunawan', 'Indah Wulandari', 'Joko Susilo',
    'Kartika Sari', 'Lukman Hakim', 'Maya Anggraini', 'Nina Febriani', 'Oscar Tanudjaya',
    'Putri Ayu', 'Rizki Pratama', 'Sari Indah', 'Tono Wibowo', 'Umi Kalsum'][i],
  email: `user${1000 + i}@example.com`,
  phone: `+62812${String(34567890 + i).slice(0, 8)}`,
  status: ['active', 'active', 'active', 'active', 'suspended', 'active', 'active', 'banned', 'active', 'active',
    'active', 'active', 'active', 'suspended', 'active', 'active', 'active', 'banned', 'active', 'active',
    'active', 'active', 'suspended', 'active', 'active'][i],
  emailVerified: i % 5 !== 0,
  phoneVerified: i % 3 !== 0,
  kycVerified: i % 4 === 0,
  totalTrips: Math.floor(Math.random() * 200),
  totalSpent: Math.floor(Math.random() * 5000000),
  registeredAt: new Date(Date.now() - Math.random() * 365 * 86400e3).toISOString(),
  lastActive: new Date(Date.now() - Math.random() * 7 * 86400e3).toISOString(),
}));

export default function Customers({ onNavigate }) {
  const [customers, setCustomers] = useState([]);
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
      const d = await api.customers();
      setCustomers(Array.isArray(d) ? d : (d.data ?? DEMO_CUSTOMERS));
    } catch { setError(true); setCustomers(DEMO_CUSTOMERS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = [...customers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [customers, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = async (cust, newStatus) => {
    setActionBusy(cust.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setCustomers((prev) => prev.map((c) => c.id === cust.id ? { ...c, status: newStatus } : c));
      setToast({ variant: 'success', message: `${cust.name} ${newStatus === 'active' ? 'diaktifkan' : 'ditangguhkan'}` });
    } catch { setToast({ variant: 'error', message: 'Gagal mengubah status' }); }
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
          <Skeleton variant="rect" height={36} width={120} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={6} />
      </div>
    );
  }

  if (error && customers.length === 0) {
    return <ErrorState title="Gagal memuat data pelanggan" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Pelanggan ({filtered.length})</h2>
        <button type="button" className="admin-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      {/* Search & Filter */}
      <div className="admin-cust__toolbar">
        <div className="admin-cust__search">
          <SearchIcon size={16} className="admin-cust__search-icon" />
          <input
            className="admin-cust__search-input"
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari pelanggan"
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

      {/* Table */}
      <Card>
        <div className="admin-cust__table-wrap">
          <table className="admin-cust__table">
            <thead>
              <tr>
                <SortHeader field="name" label="Nama" />
                <th className="admin-cust__th">Kontak</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="totalTrips" label="Trip" />
                <SortHeader field="totalSpent" label="Total" />
                <th className="admin-cust__th">Verifikasi</th>
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada pelanggan.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((cust) => (
                  <tr key={cust.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <Avatar size="sm" name={cust.name} />
                        <div>
                          <div className="admin-cust__name">{cust.name || '-'}</div>
                          <div className="admin-cust__id">#{cust.id.slice(0, 10)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><Mail size={11} /> {cust.email || '-'}</div>
                        <div><Phone size={11} /> {cust.phone || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <StatusIndicator tone={STATUS_COLORS[cust.status] || 'neutral'} label={STATUS_LABELS[cust.status] || cust.status} />
                    </td>
                    <td className="admin-cust__num">{cust.totalTrips ?? 0}</td>
                    <td className="admin-cust__num">{cust.totalSpent ? `Rp ${cust.totalSpent.toLocaleString('id-ID')}` : '-'}</td>
                    <td>
                      <div className="admin-cust__verif">
                        {cust.emailVerified && <Badge variant="success" size="sm"><CheckCircle size={10} /> Email</Badge>}
                        {cust.phoneVerified && <Badge variant="success" size="sm"><CheckCircle size={10} /> Phone</Badge>}
                        {cust.kycVerified && <Badge variant="info" size="sm"><Shield size={10} /> KYC</Badge>}
                        {!cust.emailVerified && !cust.phoneVerified && !cust.kycVerified && <span className="admin-cust__verif-none">Belum verifikasi</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('customerDetail', cust.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('customerTrips', cust.id)} title="Riwayat Trip">
                          <Map size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('customerWallet', cust.id)} title="Dompet">
                          <Wallet size={14} />
                        </button>
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('customerSupport', cust.id)} title="Support">
                          <MessageSquare size={14} />
                        </button>
                        {cust.status === 'active' ? (
                          <button className="admin-cust__act-btn admin-cust__act-btn--warn" onClick={() => handleToggleStatus(cust, 'suspended')}
                            disabled={actionBusy === cust.id} title="Tangguhkan">
                            <Ban size={14} />
                          </button>
                        ) : (
                          <button className="admin-cust__act-btn admin-cust__act-btn--success" onClick={() => handleToggleStatus(cust, 'active')}
                            disabled={actionBusy === cust.id} title="Aktifkan">
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
