import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, CreditCard, User, Truck, DollarSign, Calendar, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, BookOpen, Map,
  Receipt, RotateCcw, Building, Smartphone,
} from 'lucide-react';
import './admin.css';

const STATUS_LABELS = {
  pending: 'Menunggu', completed: 'Berhasil', failed: 'Gagal', refunded: 'Dikembalikan',
};
const STATUS_COLORS = {
  pending: 'neutral', completed: 'success', failed: 'danger', refunded: 'warning',
};
const PAYMENT_METHOD_LABELS = {
  kartu_kredit: 'Kartu Kredit', dompet: 'Dompet Ojol', transfer_bank: 'Transfer Bank',
  tunai: 'Tunai', gopay: 'GoPay', ovo: 'OVO', dana: 'DANA',
};
const PAYMENT_METHOD_ICONS = {
  kartu_kredit: <CreditCard size={14} />, dompet: <Smartphone size={14} />,
  transfer_bank: <Building size={14} />, tunai: <DollarSign size={14} />,
  gopay: <Smartphone size={14} />, ovo: <Smartphone size={14} />, dana: <Smartphone size={14} />,
};

export default function PaymentDetail({ paymentId, onBack, onNavigate }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setPayment({
        id: paymentId,
        bookingRef: 'bk_3001',
        customerName: 'Budi Santoso',
        customerId: 'usr_1000',
        customerPhone: '+6281234567890',
        driverName: 'Agus Prasetyo',
        driverId: 'drv_2000',
        amount: 145000,
        fee: 3500,
        netAmount: 141500,
        status: 'completed',
        paymentMethod: 'dompet',
        date: new Date(Date.now() - 4 * 3600e3).toISOString(),
        completedAt: new Date(Date.now() - 3.98 * 3600e3).toISOString(),
        description: 'Pembayaran trip Jakarta Pusat → BSD City',
        transactionRef: 'TXN-2024-08291',
        timeline: [
          { time: new Date(Date.now() - 4 * 3600e3).toISOString(), event: 'Transaksi dibuat', icon: 'receipt' },
          { time: new Date(Date.now() - 3.99 * 3600e3).toISOString(), event: 'Pembayaran diproses', icon: 'process' },
          { time: new Date(Date.now() - 3.98 * 3600e3).toISOString(), event: 'Pembayaran berhasil', icon: 'check' },
        ],
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [paymentId]);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async () => {
    setActionBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setPayment((prev) => ({ ...prev, status: 'refunded' }));
      setToast({ variant: 'success', message: 'Refund berhasil diproses' });
    } catch { setToast({ variant: 'error', message: 'Gagal refund' }); }
    finally { setActionBusy(false); }
  };

  const TimelineIcon = ({ icon }) => {
    const icons = {
      receipt: <Receipt size={14} />, process: <RefreshCw size={14} />, check: <CheckCircle size={14} />,
    };
    return icons[icon] || <Clock size={14} />;
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Skeleton variant="rect" width={36} height={36} radius="sm" />
          <Skeleton variant="rect" width={250} height={36} radius="sm" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 3 }}><Skeleton variant="card" lines={7} /></div>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={5} /></div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return <ErrorState title="Gagal memuat detail pembayaran" description={`ID: ${paymentId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  return (
    <div>
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <div style={{ background: 'var(--ds-color-warning-soft, #fffbeb)', borderRadius: 10, padding: '8px 10px', display: 'grid', placeItems: 'center' }}>
            <DollarSign size={18} style={{ color: 'var(--ds-color-warning, #d97706)' }} />
          </div>
          <div>
            <h2 className="admin-detail__title" style={{ fontFamily: 'monospace', fontSize: 18 }}>{payment.id}</h2>
            <div className="admin-detail__sub">{payment.description}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <Badge variant={STATUS_COLORS[payment.status] || 'neutral'} size="md">
            {STATUS_LABELS[payment.status] || payment.status}
          </Badge>
          {payment.status === 'completed' && (
            <Button variant="warning" size="sm" onClick={handleRefund} disabled={actionBusy}>
              <RotateCcw size={14} style={{ marginRight: 4 }} /> Refund
            </Button>
          )}
        </div>
      </div>

      <div className="admin-detail__grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Informasi Transaksi</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Receipt size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Ref. Transaksi</div><div style={{ fontFamily: 'monospace' }}>{payment.transactionRef}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <BookOpen size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Ref. Booking</div><div>{payment.bookingRef}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  {PAYMENT_METHOD_ICONS[payment.paymentMethod] || <CreditCard size={14} />}
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Metode</div><div>{PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Tanggal</div><div>{new Date(payment.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                </div>
                {payment.completedAt && (
                  <div className="admin-detail__info-row">
                    <CheckCircle size={14} />
                    <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Selesai</div><div>{new Date(payment.completedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Rincian Biaya</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Jumlah</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--ds-color-text-muted)' }}>Rp {payment.amount.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Biaya Layanan</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--ds-color-text-muted)' }}>−Rp {payment.fee.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--ds-color-border, #eceef3)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                  <span>Net</span>
                  <span style={{ fontFamily: 'monospace' }}>Rp {payment.netAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Kronologi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {payment.timeline.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: idx === payment.timeline.length - 1 ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-surface-2, #f1f5f9)',
                        color: idx === payment.timeline.length - 1 ? '#fff' : 'var(--ds-color-text-muted)',
                        display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0,
                      }}>
                        <TimelineIcon icon={entry.icon} />
                      </div>
                      {idx < payment.timeline.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--ds-color-border, #eceef3)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < payment.timeline.length - 1 ? 8 : 0 }}>
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
              <h3 className="admin-detail__section-title">Pelanggan</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar size="sm" name={payment.customerName} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{payment.customerName}</div>
                  <div className="admin-cust__id">#{payment.customerId}</div>
                </div>
              </div>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerDetail', payment.customerId)}>
                  <User size={16} /> Lihat Profil
                </button>
              </div>
            </div>

            {payment.driverName && (
              <div className="admin-detail__section">
                <h3 className="admin-detail__section-title">Driver</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Avatar size="sm" name={payment.driverName} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{payment.driverName}</div>
                    <div className="admin-cust__id">#{payment.driverId}</div>
                  </div>
                </div>
                <div className="admin-detail__quick-actions">
                  <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverDetail', payment.driverId)}>
                    <Truck size={16} /> Lihat Profil
                  </button>
                </div>
              </div>
            )}

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Booking Terkait</h3>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('bookingDetail', payment.bookingRef)}>
                  <BookOpen size={16} /> Lihat Booking
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
