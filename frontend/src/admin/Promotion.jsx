import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  Percent, Search as SearchIcon, X, Filter, ChevronRight, Tag, Calendar, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, ArrowUpDown, Eye,
  Plus, ToggleLeft, ToggleRight, Users, DollarSign,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'active', 'scheduled', 'expired', 'disabled'];
const STATUS_LABELS = {
  all: 'Semua', active: 'Aktif', scheduled: 'Terjadwal', expired: 'Kadaluarsa', disabled: 'Nonaktif',
};
const STATUS_COLORS = {
  active: 'success', scheduled: 'info', expired: 'neutral', disabled: 'danger',
};

const DISCOUNT_TYPES = ['percentage', 'fixed'];
const DISCOUNT_TYPE_LABELS = { percentage: 'Persentase', fixed: 'Nominal' };

const DEMO_PROMOS = Array.from({ length: 15 }, (_, i) => {
  const codes = ['HEM10', 'BARU25', 'RAMADHAN', 'NATARU', 'FLAT15', 'LOYAL20', 'WEEKEND',
    'PAYDAY', 'LIBURAN', 'HEMAT50', 'VOUCHER5', 'BONUS20', 'SPESIAL', 'MERDEKA', 'AKHIRTAHUN'];
  const types = ['percentage', 'percentage', 'fixed', 'percentage', 'fixed', 'percentage', 'percentage',
    'fixed', 'percentage', 'percentage', 'fixed', 'percentage', 'percentage', 'fixed', 'percentage'];
  const values = [10, 25, 15000, 20, 15000, 20, 15, 20000, 30, 50, 5000, 20, 40, 25000, 35];
  const now = Date.now();
  return {
    id: `promo_${7000 + i}`,
    code: codes[i],
    type: types[i],
    value: values[i],
    minPurchase: Math.floor(20000 + Math.random() * 80000),
    maxDiscount: types[i] === 'percentage' ? Math.floor(30000 + Math.random() * 70000) : values[i],
    usageCount: Math.floor(Math.random() * 500),
    usageLimit: Math.floor(100 + Math.random() * 900),
    usedByUsers: Math.floor(Math.random() * 300),
    revenueImpact: Math.floor(Math.random() * 5000000),
    description: [
      'Diskon untuk pengguna baru', 'Promo akhir pekan', 'Diskon Hari Raya',
      'Promo spesial Natal & Tahun Baru', 'Diskon flat untuk semua trip',
      'Program loyalitas pelanggan', 'Promo akhir minggu', 'Diskon hari gajian',
      'Promo liburan sekolah', 'Diskon besar-besaran', 'Voucher perjalanan singkat',
      'Bonus top up dompet', 'Promo spesial', 'Diskon HUT RI', 'Promo akhir tahun',
    ][i],
    status: ['active', 'active', 'scheduled', 'active', 'active', 'active', 'active',
      'expired', 'active', 'active', 'active', 'active', 'scheduled', 'disabled', 'expired'][i],
    startDate: new Date(now - Math.random() * 60 * 86400e3).toISOString(),
    endDate: new Date(now + Math.random() * 60 * 86400e3).toISOString(),
    createdAt: new Date(now - Math.random() * 120 * 86400e3).toISOString(),
    applicableServices: ['motor', 'mobil', 'taksi'].slice(0, 1 + (i % 3)),
  };
});

export default function Promotion({ onNavigate }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('startDate');
  const [sortDir, setSortDir] = useState('desc');
  const [actionBusy, setActionBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const d = await api.promotions();
      setPromos(Array.isArray(d) ? d : (d.data ?? DEMO_PROMOS));
    } catch { setError(true); setPromos(DEMO_PROMOS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const active = promos.filter((p) => p.status === 'active');
    return {
      totalActive: active.length,
      totalUsage: active.reduce((s, p) => s + p.usageCount, 0),
      totalRevenueImpact: active.reduce((s, p) => s + p.revenueImpact, 0),
    };
  }, [promos]);

  const filtered = useMemo(() => {
    let result = [...promos];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.code.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [promos, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = async (promo) => {
    setActionBusy(promo.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setPromos((prev) => prev.map((p) => p.id === promo.id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p));
      setToast({ variant: 'success', message: `Promo ${promo.code} ${promo.status === 'active' ? 'dinonaktifkan' : 'diaktifkan'}` });
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
          <Skeleton variant="rect" height={36} width={240} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && promos.length === 0) {
    return <ErrorState title="Gagal memuat data promo" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Promo ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-section__action" onClick={load}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
          <Button variant="primary" size="sm">
            <Plus size={14} style={{ marginRight: 4 }} />Buat Promo
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card style={{ flex: 1, minWidth: 120, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Promo Aktif</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-color-success, #16a34a)' }}>{totals.totalActive}</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Total Pemakaian</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{totals.totalUsage.toLocaleString('id-ID')}</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 160, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Dampak Pendapatan</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-color-danger, #dc2626)' }}>−Rp {totals.totalRevenueImpact.toLocaleString('id-ID')}</div>
        </Card>
      </div>

      <div className="admin-cust__toolbar">
        <div className="admin-cust__search">
          <SearchIcon size={16} className="admin-cust__search-icon" />
          <input
            className="admin-cust__search-input"
            type="text"
            placeholder="Cari kode promo atau deskripsi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari promo"
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
                <th className="admin-cust__th">Kode Promo</th>
                <th className="admin-cust__th">Diskon</th>
                <SortHeader field="status" label="Status" />
                <SortHeader field="usageCount" label="Pemakaian" />
                <th className="admin-cust__th">Sisa Kuota</th>
                <SortHeader field="startDate" label="Mulai" />
                <th className="admin-cust__th">Berakhir</th>
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada promo.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((promo) => (
                  <tr key={promo.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <div style={{ background: 'var(--ds-color-primary-soft, #eef2ff)', borderRadius: 8, padding: '6px 8px', display: 'grid', placeItems: 'center' }}>
                          <Tag size={14} style={{ color: 'var(--ds-color-primary, #4f46e5)' }} />
                        </div>
                        <div>
                          <div className="admin-cust__name" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>{promo.code}</div>
                          <div className="admin-cust__id" style={{ fontSize: 11 }}>{promo.description.slice(0, 28)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-cust__num" style={{ fontWeight: 600 }}>
                      {promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}
                      <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--ds-color-text-muted)' }}>
                        Min. Rp {promo.minPurchase.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td>
                      <Badge variant={STATUS_COLORS[promo.status] || 'neutral'} size="sm">
                        {STATUS_LABELS[promo.status] || promo.status}
                      </Badge>
                    </td>
                    <td className="admin-cust__num">{promo.usageCount.toLocaleString('id-ID')}</td>
                    <td className="admin-cust__num">
                      {(promo.usageLimit - promo.usageCount) > 0 ? (promo.usageLimit - promo.usageCount).toLocaleString('id-ID') : 0}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(promo.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(promo.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('promotionDetail', promo.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        {promo.status === 'active' ? (
                          <button className="admin-cust__act-btn admin-cust__act-btn--warn" onClick={() => handleToggleStatus(promo)}
                            disabled={actionBusy === promo.id} title="Nonaktifkan">
                            <ToggleRight size={14} />
                          </button>
                        ) : (
                          <button className="admin-cust__act-btn admin-cust__act-btn--success" onClick={() => handleToggleStatus(promo)}
                            disabled={actionBusy === promo.id} title="Aktifkan">
                            <ToggleLeft size={14} />
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
