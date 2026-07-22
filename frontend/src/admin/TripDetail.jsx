import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, Map, User, Truck, MapPin, Navigation, Calendar, Clock,
  CreditCard, DollarSign, Star, Phone, Mail, CheckCircle, XCircle,
  RefreshCw, BookOpen, MessageSquare, Wallet, Route,
} from 'lucide-react';
import './admin.css';

const STATUS_LABELS = {
  'in-progress': 'Berlangsung', completed: 'Selesai', cancelled: 'Dibatalkan',
};
const STATUS_COLORS = {
  'in-progress': 'warning', completed: 'success', cancelled: 'danger',
};

const FARE_BREAKDOWN = [
  { label: 'Tarif Dasar', amount: 15000 },
  { label: 'Biaya Jarak (28,5 km × Rp 3.500)', amount: 99750 },
  { label: 'Biaya Waktu (45 mnt × Rp 500)', amount: 22500 },
  { label: 'Biaya Layanan', amount: 5000 },
  { label: 'Diskon Promo', amount: -12500, highlight: true },
];

export default function TripDetail({ tripId, onBack, onNavigate }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setTrip({
        id: tripId,
        customerName: 'Budi Santoso',
        customerId: 'usr_1000',
        customerPhone: '+6281234567890',
        driverName: 'Agus Prasetyo',
        driverId: 'drv_2000',
        driverPhone: '+6287812345678',
        pickup: 'Jl. Merdeka No.1, Jakarta Pusat',
        destination: 'BSD City, Tangerang',
        status: 'completed',
        fare: 129750,
        distance: 28.5,
        duration: 45,
        date: new Date(Date.now() - 4 * 3600e3).toISOString(),
        paymentMethod: 'dompet',
        rating: 5.0,
        review: 'Pelayanan sangat baik, driver ramah dan membantu. Perjalanan nyaman.',
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
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

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
          <div style={{ flex: 3 }}><Skeleton variant="card" lines={8} /></div>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={5} /></div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return <ErrorState title="Gagal memuat detail trip" description={`ID: ${tripId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  const totalFare = FARE_BREAKDOWN.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <div style={{ background: 'var(--ds-color-success-soft, #f0fdf4)', borderRadius: 10, padding: '8px 10px', display: 'grid', placeItems: 'center' }}>
            <Navigation size={18} style={{ color: 'var(--ds-color-success, #16a34a)' }} />
          </div>
          <div>
            <h2 className="admin-detail__title" style={{ fontFamily: 'monospace', fontSize: 18 }}>{trip.id}</h2>
            <div className="admin-detail__sub">{trip.pickup.slice(0, 30)} → {trip.destination.slice(0, 30)}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <Badge variant={STATUS_COLORS[trip.status] || 'neutral'} size="md">
            {STATUS_LABELS[trip.status] || trip.status}
          </Badge>
        </div>
      </div>

      <div className="admin-detail__grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        {/* Left — Route & Timeline */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Rute Perjalanan</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: 'var(--ds-color-primary, #4f46e5)' }} />
                    <div style={{ width: 2, height: 28, background: 'var(--ds-color-border, #eceef3)' }} />
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: 'var(--ds-color-danger, #dc2626)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Penjemputan</div>
                      <div style={{ fontSize: 14 }}>{trip.pickup}</div>
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Tujuan</div>
                      <div style={{ fontSize: 14 }}>{trip.destination}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-detail__stats" style={{ marginTop: 16 }}>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{trip.distance} km</div>
                  <div className="admin-detail__stat-label">Jarak</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{trip.duration} mnt</div>
                  <div className="admin-detail__stat-label">Durasi</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {trip.rating} <Star size={12} style={{ color: '#f59e0b' }} />
                    </span>
                  </div>
                  <div className="admin-detail__stat-label">Rating</div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Rincian Tarif</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FARE_BREAKDOWN.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{
                      color: item.highlight ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-text, #111)',
                      fontWeight: item.highlight ? 500 : 400,
                    }}>{item.label}</span>
                    <span style={{
                      color: item.highlight ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-text-muted, #6b7280)',
                      fontWeight: item.highlight ? 600 : 400,
                      fontFamily: 'monospace',
                    }}>
                      {item.amount < 0 ? `-Rp ${Math.abs(item.amount).toLocaleString('id-ID')}` : `Rp ${item.amount.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--ds-color-border, #eceef3)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'monospace' }}>Rp {totalFare.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {trip.review && (
              <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
                <h3 className="admin-detail__section-title">Ulasan Pelanggan</h3>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= trip.rating ? '#f59e0b' : 'none'}
                      color="#f59e0b" style={{ opacity: s <= trip.rating ? 1 : 0.2 }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ds-color-text, #111)' }}>
                  "{trip.review}"
                </p>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card style={{ marginTop: 16 }}>
            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Kronologi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {trip.timeline.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: idx === trip.timeline.length - 1 ? 'var(--ds-color-success, #16a34a)' : 'var(--ds-color-surface-2, #f1f5f9)',
                        color: idx === trip.timeline.length - 1 ? '#fff' : 'var(--ds-color-text-muted)',
                        display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0,
                      }}>
                        <TimelineIcon icon={entry.icon} />
                      </div>
                      {idx < trip.timeline.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--ds-color-border, #eceef3)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < trip.timeline.length - 1 ? 8 : 0 }}>
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
                <Avatar size="sm" name={trip.customerName} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{trip.customerName}</div>
                  <div className="admin-cust__id">#{trip.customerId}</div>
                </div>
              </div>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerDetail', trip.customerId)}>
                  <User size={16} /> Lihat Profil
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerTrips', trip.customerId)}>
                  <Route size={16} /> Riwayat Trip
                </button>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Driver</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar size="sm" name={trip.driverName} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-strong, #111)' }}>{trip.driverName}</div>
                  <div className="admin-cust__id">#{trip.driverId}</div>
                </div>
              </div>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverDetail', trip.driverId)}>
                  <Truck size={16} /> Lihat Profil
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverTrips', trip.driverId)}>
                  <Route size={16} /> Riwayat Trip
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
