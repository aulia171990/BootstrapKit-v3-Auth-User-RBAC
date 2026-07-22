import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, BookOpen, User, Truck, MapPin, Navigation, Calendar, Clock,
  CreditCard, DollarSign, Star, Phone, Mail, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Map, MessageSquare, Wallet,
} from 'lucide-react';
import './admin.css';

const STATUS_LABELS = {
  pending: 'Menunggu', confirmed: 'Dikonfirmasi', 'in-progress': 'Berlangsung',
  completed: 'Selesai', cancelled: 'Dibatalkan', refunded: 'Dikembalikan',
};
const STATUS_COLORS = {
  pending: 'neutral', confirmed: 'info', 'in-progress': 'warning',
  completed: 'success', cancelled: 'danger', refunded: 'neutral',
};

const PAYMENT_LABELS = { tunai: 'Tunai', kartu: 'Kartu Kredit', dompet: 'Dompet Digital', transfer: 'Transfer Bank' };

export default function BookingDetail({ bookingId, onBack, onNavigate }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setBooking({
        id: bookingId,
        customerName: 'Budi Santoso',
        customerId: 'usr_1000',
        customerPhone: '+6281234567890',
        driverName: 'Agus Prasetyo',
        driverId: 'drv_2000',
        driverPhone: '+6287812345678',
        pickup: 'Jl. Merdeka No.1, Jakarta Pusat',
        destination: 'BSD City, Tangerang',
        status: 'completed',
        fare: 145000,
        distance: 28.5,
        duration: 45,
        date: new Date(Date.now() - 4 * 3600e3).toISOString(),
        paymentMethod: 'dompet',
        rating: 5.0,
        timeline: [
          { time: new Date(Date.now() - 4 * 3600e3).toISOString(), event: 'Pesanan dibuat', icon: 'book' },
          { time: new Date(Date.now() - 3.9 * 3600e3).toISOString(), event: 'Driver menerima pesanan', icon: 'truck' },
          { time: new Date(Date.now() - 3.8 * 3600e3).toISOString(), event: 'Driver tiba di lokasi penjemputan', icon: 'map' },
          { time: new Date(Date.now() - 3.7 * 3600e3).toISOString(), event: 'Perjalanan dimulai', icon: 'nav' },
          { time: new Date(Date.now() - 3.2 * 3600e3).toISOString(), event: 'Perjalanan selesai', icon: 'check' },
          { time: new Date(Date.now() - 3.15 * 3600e3).toISOString(), event: 'Pembayaran diterima', icon: 'dollar' },
        ],
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    setActionBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
      setToast({ variant: 'success', message: 'Booking dibatalkan' });
    } catch { setToast({ variant: 'error', message: 'Gagal membatalkan booking' }); }
    finally { setActionBusy(false); }
  };

  const TimelineIcon = ({ icon }) => {
    const icons = {
      book: <BookOpen size={14} />, truck: <Truck size={14} />, map: <MapPin size={14} />,
      nav: <Navigation size={14} />, check: <CheckCircle size={14} />, dollar: <DollarSign size={14} />,
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

  if (error || !booking) {
    return <ErrorState title="Gagal memuat detail booking" description={`ID: ${bookingId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <div style={{ background: 'var(--ds-color-primary-soft, #eef2ff)', borderRadius: 10, padding: '8px 10px', display: 'grid', placeItems: 'center' }}>
            <BookOpen size={18} style={{ color: 'var(--ds-color-primary, #4f46e5)' }} />
          </div>
          <div>
            <h2 className="admin-detail__title" style={{ fontFamily: 'monospace', fontSize: 18 }}>{booking.id}</h2>
            <div className="admin-detail__sub">{booking.pickup.slice(0, 30)} → {booking.destination.slice(0, 30)}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <Badge variant={STATUS_COLORS[booking.status] || 'neutral'} size="md">
            {STATUS_LABELS[booking.status] || booking.status}
          </Badge>
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button variant="danger" size="sm" onClick={handleCancel} disabled={actionBusy}>
              Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="admin-detail__grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        {/* Left — Trip & Timeline */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Detail Perjalanan</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <MapPin size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Penjemputan</div><div>{booking.pickup}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Navigation size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Tujuan</div><div>{booking.destination}</div></div>
                </div>
              </div>
              <div className="admin-detail__stats" style={{ marginTop: 12 }}>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{booking.distance} km</div>
                  <div className="admin-detail__stat-label">Jarak</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{booking.duration} mnt</div>
                  <div className="admin-detail__stat-label">Durasi</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">Rp {booking.fare.toLocaleString('id-ID')}</div>
                  <div className="admin-detail__stat-label">Tarif</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {booking.rating} <Star size={12} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="admin-detail__stat-label">Rating</div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Pembayaran</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <CreditCard size={14} /><span>{PAYMENT_LABELS[booking.paymentMethod] || booking.paymentMethod}</span>
                </div>
                <div className="admin-detail__info-row">
                  <DollarSign size={14} /><span>Rp {booking.fare.toLocaleString('id-ID')}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} /><span>{new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Kronologi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {booking.timeline.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: idx === booking.timeline.length - 1 ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-surface-2, #f1f5f9)',
                        color: idx === booking.timeline.length - 1 ? '#fff' : 'var(--ds-color-text-muted)',
                        display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0,
                      }}>
                        <TimelineIcon icon={entry.icon} />
                      </div>
                      {idx < booking.timeline.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--ds-color-border, #eceef3)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < booking.timeline.length - 1 ? 8 : 0 }}>
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

        {/* Right — Customer & Driver */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Pelanggan</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar size="sm" name={booking.customerName} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{booking.customerName}</div>
                  <div className="admin-cust__id">#{booking.customerId}</div>
                </div>
              </div>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerDetail', booking.customerId)}>
                  <User size={16} /> Lihat Profil
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerTrips', booking.customerId)}>
                  <Map size={16} /> Riwayat Trip
                </button>
              </div>
            </div>

            {booking.driverName && (
              <div className="admin-detail__section">
                <h3 className="admin-detail__section-title">Driver</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Avatar size="sm" name={booking.driverName} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{booking.driverName}</div>
                    <div className="admin-cust__id">#{booking.driverId}</div>
                  </div>
                </div>
                <div className="admin-detail__quick-actions">
                  <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverDetail', booking.driverId)}>
                    <Truck size={16} /> Lihat Profil
                  </button>
                  <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverTrips', booking.driverId)}>
                    <Map size={16} /> Riwayat Trip
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
