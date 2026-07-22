import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, Wallet, User, Truck, DollarSign, Calendar, Clock,
  CheckCircle, XCircle, RefreshCw, ArrowUpRight, ArrowDownLeft, Smartphone, Building,
  CreditCard, Receipt,
} from 'lucide-react';
import './admin.css';

const TYPE_LABELS = {
  topup: 'Top Up', payment: 'Pembayaran', withdrawal: 'Penarikan', refund: 'Refund', bonus: 'Bonus',
};
const TYPE_COLORS = {
  topup: 'success', payment: 'danger', withdrawal: 'warning', refund: 'info', bonus: 'success',
};

const PAYMENT_METHOD_LABELS = {
  gopay: 'GoPay', ovo: 'OVO', dana: 'DANA', dompet: 'Dompet Ojol',
  transfer_bank: 'Transfer Bank', bca: 'BCA', mandiri: 'Mandiri', bri: 'BRI',
};

export default function WalletDetail({ txId, onBack, onNavigate }) {
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setTx({
        id: txId,
        type: 'topup',
        amount: 100000,
        balance: 450000,
        fee: 0,
        userName: 'Budi Santoso',
        userId: 'usr_1000',
        userRole: 'customer',
        userPhone: '+6281234567890',
        description: 'Top Up melalui GoPay',
        paymentMethod: 'gopay',
        date: new Date(Date.now() - 86400e3).toISOString(),
        completedAt: new Date(Date.now() - 86300e3).toISOString(),
        status: 'completed',
        referenceId: 'GOPAY-TXN-20240829-001',
        timeline: [
          { time: new Date(Date.now() - 86400e3).toISOString(), event: 'Transaksi dibuat', icon: 'receipt' },
          { time: new Date(Date.now() - 86350e3).toISOString(), event: 'Pembayaran diproses melalui GoPay', icon: 'process' },
          { time: new Date(Date.now() - 86300e3).toISOString(), event: 'Saldo dompet bertambah Rp 100.000', icon: 'check' },
        ],
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [txId]);

  useEffect(() => { load(); }, [load]);

  const TimelineIcon = ({ icon }) => {
    const icons = {
      receipt: <Receipt size={14} />, process: <RefreshCw size={14} />, check: <CheckCircle size={14} />,
    };
    return icons[icon] || <Clock size={14} />;
  };

  const isInflow = tx && (tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bonus');

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Skeleton variant="rect" width={36} height={36} radius="sm" />
          <Skeleton variant="rect" width={250} height={36} radius="sm" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 3 }}><Skeleton variant="card" lines={7} /></div>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={4} /></div>
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return <ErrorState title="Gagal memuat detail transaksi" description={`ID: ${txId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  return (
    <div>
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <div style={{
            background: isInflow ? 'var(--ds-color-success-soft, #f0fdf4)' : 'var(--ds-color-danger-soft, #fef2f2)',
            borderRadius: 10, padding: '8px 10px', display: 'grid', placeItems: 'center',
          }}>
            {isInflow
              ? <ArrowDownLeft size={18} style={{ color: 'var(--ds-color-success, #16a34a)' }} />
              : <ArrowUpRight size={18} style={{ color: 'var(--ds-color-danger, #dc2626)' }} />}
          </div>
          <div>
            <h2 className="admin-detail__title" style={{ fontFamily: 'monospace', fontSize: 18 }}>{tx.id}</h2>
            <div className="admin-detail__sub">{tx.description}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <Badge variant={TYPE_COLORS[tx.type] || 'neutral'} size="md">{TYPE_LABELS[tx.type] || tx.type}</Badge>
          <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'danger' : 'neutral'} size="md">
            {tx.status === 'completed' ? 'Berhasil' : tx.status === 'failed' ? 'Gagal' : 'Menunggu'}
          </Badge>
        </div>
      </div>

      <div className="admin-detail__grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Detail Transaksi</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <DollarSign size={14} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Jumlah</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: isInflow ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-danger, #dc2626)' }}>
                      {isInflow ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="admin-detail__info-row">
                  <Wallet size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Saldo Akhir</div><div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}>Rp {tx.balance.toLocaleString('id-ID')}</div></div>
                </div>
                {tx.fee > 0 && (
                  <div className="admin-detail__info-row">
                    <Receipt size={14} />
                    <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Biaya</div><div>Rp {tx.fee.toLocaleString('id-ID')}</div></div>
                  </div>
                )}
                <div className="admin-detail__info-row">
                  <Smartphone size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Metode</div><div>{PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Tanggal</div><div>{new Date(tx.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                </div>
                {tx.referenceId && (
                  <div className="admin-detail__info-row">
                    <Receipt size={14} />
                    <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Ref. Eksternal</div><div style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.referenceId}</div></div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Kronologi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {tx.timeline.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: idx === tx.timeline.length - 1 ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-surface-2, #f1f5f9)',
                        color: idx === tx.timeline.length - 1 ? '#fff' : 'var(--ds-color-text-muted)',
                        display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0,
                      }}>
                        <TimelineIcon icon={entry.icon} />
                      </div>
                      {idx < tx.timeline.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--ds-color-border, #eceef3)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < tx.timeline.length - 1 ? 8 : 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ds-color-text, #111)' }}>{entry.event}</div>
                      <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted, #8a90a2)', marginTop: 2 }}>
                        {new Date(entry.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">{tx.userRole === 'customer' ? 'Pelanggan' : 'Driver'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar size="sm" name={tx.userName} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{tx.userName}</div>
                  <div className="admin-cust__id">#{tx.userId} · {tx.userRole === 'customer' ? 'Pelanggan' : 'Driver'}</div>
                </div>
              </div>
              <div className="admin-detail__quick-actions">
                {tx.userRole === 'customer' ? (
                  <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerDetail', tx.userId)}>
                    <User size={16} /> Lihat Profil
                  </button>
                ) : (
                  <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverDetail', tx.userId)}>
                    <Truck size={16} /> Lihat Profil
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
