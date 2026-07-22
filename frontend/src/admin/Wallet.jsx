import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, EmptyState, Avatar,
  Icon, StatusIndicator, Toast, Pagination, Search,
} from '../design-system/index.js';
import {
  Wallet as WalletIcon, Search as SearchIcon, X, Filter, ChevronRight, User, Truck,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, Calendar, Clock,
  RefreshCw, ArrowUpDown, Eye, Plus, Minus, ArrowUpRight, ArrowDownLeft,
  DollarSign, CreditCard, RotateCcw, Smartphone,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const TYPE_OPTIONS = ['all', 'topup', 'payment', 'withdrawal', 'refund', 'bonus'];
const TYPE_LABELS = {
  all: 'Semua', topup: 'Top Up', payment: 'Pembayaran', withdrawal: 'Penarikan', refund: 'Refund', bonus: 'Bonus',
};
const TYPE_COLORS = {
  topup: 'success', payment: 'danger', withdrawal: 'warning', refund: 'info', bonus: 'success',
};
const TYPE_ICONS = {
  topup: <ArrowDownLeft size={14} />, payment: <ArrowUpRight size={14} />,
  withdrawal: <ArrowUpRight size={14} />, refund: <ArrowDownLeft size={14} />, bonus: <ArrowDownLeft size={14} />,
};

const DEMO_TRANSACTIONS = Array.from({ length: 25 }, (_, i) => {
  const types = ['topup', 'payment', 'payment', 'topup', 'payment', 'withdrawal', 'payment', 'topup', 'payment', 'refund',
    'payment', 'topup', 'payment', 'bonus', 'payment', 'topup', 'withdrawal', 'payment', 'topup', 'payment',
    'refund', 'payment', 'bonus', 'payment', 'topup'];
  const amounts = [50000, 45000, 32000, 100000, 55000, 200000, 38000, 150000, 28000, 45000,
    65000, 200000, 52000, 25000, 35000, 75000, 500000, 42000, 250000, 58000,
    32000, 47000, 15000, 61000, 300000];
  const balance = amounts.reduce((sum, a, idx) => sum + (idx % 2 === 0 ? a : -a), 500000);
  return {
    id: `wtx_${6000 + i}`,
    type: types[i],
    amount: amounts[i],
    balance: balance,
    userId: i % 3 === 0 ? `usr_${1000 + (i % 10)}` : `drv_${2000 + (i % 10)}`,
    userName: i % 3 === 0
      ? ['Budi Santoso', 'Siti Rahmawati', 'Ahmad Fauzi', 'Dewi Lestari'][i % 4]
      : ['Agus Prasetyo', 'Bayu Saputra', 'Candra Wijaya', 'Dimas Ardiansyah', 'Eko Prabowo'][i % 5],
    userRole: i % 3 === 0 ? 'customer' : 'driver',
    description: types[i] === 'topup' ? 'Top Up melalui GoPay' :
      types[i] === 'payment' ? 'Pembayaran trip Jakarta Pusat → BSD City' :
      types[i] === 'withdrawal' ? 'Penarikan saldo ke rekening BCA' :
      types[i] === 'refund' ? 'Refund pembatalan trip' : 'Bonus referensi pengguna baru',
    paymentMethod: ['gopay', 'dompet', 'transfer_bank', 'gopay', 'dompet', 'bca', 'dompet',
      'ovo', 'dompet', 'dompet', 'dompet', 'dana', 'dompet', 'dompet', 'dompet',
      'gopay', 'bca', 'dompet', 'gopay', 'dompet', 'dompet', 'dompet', 'dompet', 'dompet', 'gopay'][i],
    date: new Date(Date.now() - Math.random() * 30 * 86400e3).toISOString(),
    status: ['completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'completed',
      'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed',
      'completed', 'completed', 'failed', 'completed', 'completed', 'completed',
      'completed', 'completed', 'completed', 'completed', 'completed'][i],
  };
});

export default function Wallet({ onNavigate }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const d = await api.wallet();
      setTxs(Array.isArray(d) ? d : (d.data ?? DEMO_TRANSACTIONS));
    } catch { setError(true); setTxs(DEMO_TRANSACTIONS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const completed = txs.filter((t) => t.status === 'completed');
    return {
      totalIn: completed.filter((t) => t.type === 'topup' || t.type === 'refund' || t.type === 'bonus').reduce((s, t) => s + t.amount, 0),
      totalOut: completed.filter((t) => t.type === 'payment' || t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
    };
  }, [txs]);

  const filtered = useMemo(() => {
    let result = [...txs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        (t.userName || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.paymentMethod || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter);
    result.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [txs, search, typeFilter, sortField, sortDir]);

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
          <Skeleton variant="rect" height={36} width={280} radius="sm" />
        </div>
        <Skeleton variant="table" rows={6} cols={7} />
      </div>
    );
  }

  if (error && txs.length === 0) {
    return <ErrorState title="Gagal memuat transaksi dompet" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Dompet ({filtered.length})</h2>
        <button type="button" className="admin-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card style={{ flex: 1, minWidth: 140, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Total Masuk</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-color-success, #16a34a)' }}>Rp {totals.totalIn.toLocaleString('id-ID')}</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 140, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Total Keluar</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-color-danger, #dc2626)' }}>Rp {totals.totalOut.toLocaleString('id-ID')}</div>
        </Card>
      </div>

      <div className="admin-cust__toolbar">
        <div className="admin-cust__search">
          <SearchIcon size={16} className="admin-cust__search-icon" />
          <input
            className="admin-cust__search-input"
            type="text"
            placeholder="Cari ID, pengguna, atau deskripsi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Cari transaksi"
          />
          {search && (
            <button className="admin-cust__search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="admin-cust__filters">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              className={`admin-cust__filter-btn${typeFilter === t ? ' admin-cust__filter-btn--active' : ''}`}
              onClick={() => { setTypeFilter(t); setPage(1); }}
            >
              {TYPE_LABELS[t]}
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
                <th className="admin-cust__th">Pengguna</th>
                <SortHeader field="type" label="Tipe" />
                <SortHeader field="amount" label="Jumlah" />
                <th className="admin-cust__th">Saldo</th>
                <SortHeader field="date" label="Tanggal" />
                <th className="admin-cust__th">Status</th>
                <th className="admin-cust__th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={SearchIcon} title="Tidak ada hasil" description={search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada transaksi.'} />
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="admin-cust__row">
                    <td>
                      <div className="admin-cust__name-cell">
                        <div style={{
                          background: tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bonus'
                            ? 'var(--ds-color-success-soft, #f0fdf4)' : 'var(--ds-color-danger-soft, #fef2f2)',
                          borderRadius: 8, padding: '6px 8px', display: 'grid', placeItems: 'center',
                        }}>
                          {tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bonus'
                            ? <ArrowDownLeft size={14} style={{ color: 'var(--ds-color-success, #16a34a)' }} />
                            : <ArrowUpRight size={14} style={{ color: 'var(--ds-color-danger, #dc2626)' }} />}
                        </div>
                        <div>
                          <div className="admin-cust__name" style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.id}</div>
                          <div className="admin-cust__id" style={{ fontSize: 11 }}>{tx.description.slice(0, 24)}…</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cust__contact">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {tx.userRole === 'customer' ? <User size={11} /> : <Truck size={11} />}
                          {tx.userName || '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={TYPE_COLORS[tx.type] || 'neutral'} size="sm">{TYPE_LABELS[tx.type] || tx.type}</Badge>
                    </td>
                    <td className="admin-cust__num" style={{
                      fontWeight: 600,
                      color: tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bonus'
                        ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-danger, #dc2626)',
                    }}>
                      {tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bonus' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="admin-cust__num" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      Rp {tx.balance?.toLocaleString('id-ID') ?? '-'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'danger' : 'neutral'} size="sm">
                        {tx.status === 'completed' ? 'Berhasil' : tx.status === 'failed' ? 'Gagal' : 'Menunggu'}
                      </Badge>
                    </td>
                    <td>
                      <div className="admin-cust__actions">
                        <button className="admin-cust__act-btn" onClick={() => onNavigate?.('walletDetail', tx.id)} title="Detail">
                          <Eye size={14} />
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
