import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  CreditCard, Search as SearchIcon, X, Filter, ChevronRight, User, Truck,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, Calendar, Clock,
  RefreshCw, ArrowUpDown, Eye, DollarSign, Banknote, Receipt, RotateCcw,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const STATUS_OPTIONS = ['all', 'pending', 'completed', 'failed', 'refunded'];
const STATUS_LABELS = {
  all: 'Semua', pending: 'Menunggu', completed: 'Berhasil', failed: 'Gagal', refunded: 'Dikembalikan',
};
const STATUS_COLORS = {
  pending: 'neutral', completed: 'success', failed: 'danger', refunded: 'warning',
};

const PAYMENT_METHODS = ['kartu_kredit', 'dompet', 'transfer_bank', 'tunai', 'gopay', 'ovo', 'dana'];
const PAYMENT_METHOD_LABELS = {
  kartu_kredit: 'Kartu Kredit', dompet: 'Dompet Ojol', transfer_bank: 'Transfer Bank',
  tunai: 'Tunai', gopay: 'GoPay', ovo: 'OVO', dana: 'DANA',
};

const DEMO_PAYMENTS = Array.from({ length: 25 }, (_, i) => ({
  id: `pay_${5000 + i}`,
  bookingRef: `bk_${3000 + (i % 25)}`,
  customerName: ['Budi Santoso', 'Siti Rahmawati', 'Ahmad Fauzi', 'Dewi Lestari', 'Rudi Hermawan',
    'Ani Susanti', 'Bambang Wijaya', 'Citra Dewi', 'Doni Prasetyo', 'Eka Putri',
    'Fajar Hidayat', 'Gita Permata', 'Hendra Gunawan', 'Indah Wulandari', 'Joko Susilo',
    'Kartika Sari', 'Lukman Hakim', 'Maya Anggraini', 'Nina Febriani', 'Oscar Tanudjaya',
    'Putri Ayu', 'Rizki Pratama', 'Sari Indah', 'Tono Wibowo', 'Umi Kalsum'][i],
  customerId: `usr_${1000 + (i % 10)}`,
  driverName: i % 3 !== 0 ? ['Agus Prasetyo', 'Bayu Saputra', 'Candra Wijaya', 'Dimas Ardiansyah', 'Eko Prabowo',
    'Farhan Maulana', 'Gilang Ramadhan', 'Hardi Suharto', 'Irfan Nugroho', 'Jati Kusumo'][i % 10] : null,
  driverId: i % 3 !== 0 ? `drv_${2000 + (i % 10)}` : null,
  amount: Math.floor(15000 + Math.random() * 300000),
  fee: Math.floor(1000 + Math.random() * 8000),
  status: ['completed', 'completed', 'completed', 'pending', 'completed', 'completed',
    'completed', 'failed', 'completed', 'completed', 'completed', 'refunded',
    'completed', 'completed', 'completed', 'pending', 'completed', 'completed',
    'completed', 'completed', 'refunded', 'completed', 'completed', 'failed', 'completed'][i],
  paymentMethod: PAYMENT_METHODS[i % 7],
  date: new Date(Date.now() - Math.random() * 30 * 86400e3).toISOString(),
  completedAt: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 86400e3 + 600e3).toISOString() : null,
}));

export default function Payments({ onNavigate }) {
  const [payments, setPayments] = useState([]);
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
      const d = await api.payments();
      setPayments(Array.isArray(d) ? d : (d.data ?? DEMO_PAYMENTS));
    } catch { setError(true); setPayments(DEMO_PAYMENTS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = [...payments];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.id.toLowerCase().includes(q) ||
        p.bookingRef.toLowerCase().includes(q) ||
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.driverName || '').toLowerCase().includes(q) ||
        (p.paymentMethod || '').toLowerCase().includes(q)
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
  }, [payments, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleRefund = async (payment) => {
    setActionBusy(payment.id);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setPayments((prev) => prev.map((p) => p.id === payment.id ? { ...p, status: 'refunded' } : p));
      setToast({ variant: 'success', message: `Refund ${payment.id} berhasil` });
    } catch { setToast({ variant: 'error', message: 'Gagal refund' }); }
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
          <Skeleton variant="rect" height={36} width={220} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && payments.length === 0) {
    return <ErrorState title="Gagal memuat data pembayaran" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Pembayaran ({filtered.length})</h2>
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
            placeholder="Cari ID, booking, pelanggan, atau metode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari pembayaran"
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
                <th className="admin-cust__th">ID Transaksi</th>
                <th className="admin-cust__th">Pelanggan</th>
                <th className="admin-cust__th">Metode</th>
                <SortHeader field="amount" label="Jumlah" />
                <SortHeader field="status" label="Status" />
                <SortHeader field="date" label="Tanggal" />
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada transaksi.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((payment) => (
                  <tr key={payment.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <div style={{ background: 'var(--ds-color-warning-soft, #fffbeb)', borderRadius: 8, padding: '6px 8px', display: 'grid', placeItems: 'center' }}>
                          <DollarSign size={14} style={{ color: 'var(--ds-color-warning, #d97706)' }} />
                        </div>
                        <div>
                          <div className="admin-cust__name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{payment.id}</div>
                          <div className="admin-cust__id" style={{ fontSize: 11 }}>{payment.bookingRef}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div><User size={11} /> {payment.customerName || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <Badge variant="neutral" size="sm">{PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</Badge>
                    </td>
                    <td className="admin-cust__num">
                      <div style={{ fontWeight: 600 }}>Rp {payment.amount.toLocaleString('id-ID')}</div>
                      <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>Biaya Rp {payment.fee.toLocaleString('id-ID')}</div>
                    </td>
                    <td>
                      <Badge variant={STATUS_COLORS[payment.status] || 'neutral'} size="sm">
                        {STATUS_LABELS[payment.status] || payment.status}
                      </Badge>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(payment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('paymentDetail', payment.id)} title="Detail">
                          <Eye size={14} />
                        </button>
                        {payment.status === 'completed' && (
                          <button className="admin-cust__act-btn admin-cust__act-btn--warn" onClick={() => handleRefund(payment)}
                            disabled={actionBusy === payment.id} title="Refund">
                            <RotateCcw size={14} />
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
