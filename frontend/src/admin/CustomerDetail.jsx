import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, User, Mail, Phone, Calendar, Shield, Map, Wallet, MessageSquare,
  CheckCircle, XCircle, AlertTriangle, Star, Clock, RefreshCw,
} from 'lucide-react';
import './admin.css';

export default function CustomerDetail({ customerId, onBack, onNavigate }) {
  const [cust, setCust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setCust({
        id: customerId,
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        phone: '+6281234567890',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
        kycVerified: true,
        totalTrips: 142,
        totalSpent: 3850000,
        rating: 4.8,
        registeredAt: new Date(Date.now() - 180 * 86400e3).toISOString(),
        lastActive: new Date(Date.now() - 3600e3).toISOString(),
        avatar: null,
        recentTrips: [
          { id: 'tr_001', date: new Date(Date.now() - 3600e3).toISOString(), route: 'Jakarta Pusat → Jakarta Selatan', fare: 45000, status: 'completed' },
          { id: 'tr_002', date: new Date(Date.now() - 86400e3).toISOString(), route: 'Jakarta Barat → Jakarta Timur', fare: 38000, status: 'completed' },
          { id: 'tr_003', date: new Date(Date.now() - 2 * 86400e3).toISOString(), route: 'Bandung → Jakarta', fare: 185000, status: 'completed' },
        ],
        walletBalance: 250000,
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async () => {
    setActionBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setCust((prev) => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }));
      setToast({ variant: 'success', message: `Status pelanggan ${cust?.status === 'active' ? 'ditangguhkan' : 'diaktifkan'}` });
    } catch { setToast({ variant: 'error', message: 'Gagal mengubah status' }); }
    finally { setActionBusy(false); }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Skeleton variant="rect" width={36} height={36} radius="sm" />
          <Skeleton variant="rect" width={200} height={36} radius="sm" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={6} /></div>
          <div style={{ flex: 1 }}><Skeleton variant="card" lines={4} /></div>
        </div>
      </div>
    );
  }

  if (error || !cust) {
    return <ErrorState title="Gagal memuat detail pelanggan" description={`ID: ${customerId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <Avatar size="md" name={cust.name} />
          <div>
            <h2 className="admin-detail__title">{cust.name}</h2>
            <div className="admin-detail__sub">Pelanggan sejak {new Date(cust.registeredAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <StatusIndicator tone={cust.status === 'active' ? 'success' : 'warning'} label={cust.status === 'active' ? 'Aktif' : 'Ditangguhkan'} pulse={cust.status === 'active'} />
          <Button variant={cust.status === 'active' ? 'warning' : 'success'} size="sm" onClick={handleToggleStatus} disabled={actionBusy}>
            {cust.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
          </Button>
        </div>
      </div>

      <div className="admin-detail__grid">
        {/* Info */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Informasi Pelanggan</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Mail size={14} /><span>{cust.email}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Phone size={14} /><span>{cust.phone}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} /><span>Bergabung {new Date(cust.registeredAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Clock size={14} /><span>Terakhir aktif {new Date(cust.lastActive).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Verifikasi</h3>
              <div className="admin-detail__verif">
                <Badge variant={cust.emailVerified ? 'success' : 'neutral'} size="sm">
                  {cust.emailVerified ? <CheckCircle size={10} /> : <XCircle size={10} />} Email
                </Badge>
                <Badge variant={cust.phoneVerified ? 'success' : 'neutral'} size="sm">
                  {cust.phoneVerified ? <CheckCircle size={10} /> : <XCircle size={10} />} Telepon
                </Badge>
                <Badge variant={cust.kycVerified ? 'info' : 'neutral'} size="sm">
                  {cust.kycVerified ? <Shield size={10} /> : <XCircle size={10} />} KYC
                </Badge>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Aktivitas</h3>
              <div className="admin-detail__stats">
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{cust.totalTrips}</div>
                  <div className="admin-detail__stat-label">Total Trip</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">Rp {cust.totalSpent.toLocaleString('id-ID')}</div>
                  <div className="admin-detail__stat-label">Total Pengeluaran</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{cust.rating}</div>
                  <div className="admin-detail__stat-label"><Star size={10} /> Rating</div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Tautan Cepat</h3>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerTrips', cust.id)}>
                  <Map size={16} /> Riwayat Trip
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerWallet', cust.id)}>
                  <Wallet size={16} /> Dompet (Rp {cust.walletBalance.toLocaleString('id-ID')})
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('customerSupport', cust.id)}>
                  <MessageSquare size={16} /> Support
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Trips */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <div className="admin-detail__section-header">
                <h3 className="admin-detail__section-title">Trip Terbaru</h3>
                <button className="admin-section__action" onClick={() => onNavigate?.('customerTrips', cust.id)}>Lihat Semua</button>
              </div>
              {cust.recentTrips.map((trip) => (
                <div key={trip.id} className="admin-detail__trip">
                  <div className="admin-detail__trip-route">{trip.route}</div>
                  <div className="admin-detail__trip-meta">
                    <span>{new Date(trip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    <span>Rp {trip.fare.toLocaleString('id-ID')}</span>
                    <Badge variant={trip.status === 'completed' ? 'success' : 'warning'} size="sm">{trip.status}</Badge>
                  </div>
                </div>
              ))}
              {cust.recentTrips.length === 0 && <div className="admin-cust__empty">Belum ada trip.</div>}
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
