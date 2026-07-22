import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, User, Mail, Phone, Calendar, Shield, Map, Wallet, MessageSquare,
  CheckCircle, XCircle, AlertTriangle, Star, Clock, RefreshCw, Truck, FileText,
} from 'lucide-react';
import './admin.css';

export default function DriverDetail({ driverId, onBack, onNavigate }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setDriver({
        id: driverId,
        name: 'Agus Prasetyo',
        email: 'agus.prasetyo@ojol.example',
        phone: '+6287812345678',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
        kycVerified: true,
        vehicleType: 'Motor',
        vehiclePlate: 'B 1234 ABC',
        vehicleBrand: 'Honda',
        vehicleModel: 'Vario 160',
        vehicleYear: 2023,
        licenseNumber: 'SIM C 98765432',
        licenseExpiry: new Date(Date.now() + 180 * 86400e3).toISOString(),
        totalTrips: 384,
        totalEarnings: 8750000,
        rating: 4.9,
        acceptanceRate: 95,
        completionRate: 98,
        registeredAt: new Date(Date.now() - 270 * 86400e3).toISOString(),
        lastActive: new Date(Date.now() - 600e3).toISOString(),
        avatar: null,
        recentTrips: [
          { id: 'tr_101', date: new Date(Date.now() - 1800e3).toISOString(), route: 'Jakarta Pusat → Jakarta Selatan', fare: 55000, status: 'completed' },
          { id: 'tr_102', date: new Date(Date.now() - 7200e3).toISOString(), route: 'Jakarta Barat → Jakarta Timur', fare: 42000, status: 'completed' },
          { id: 'tr_103', date: new Date(Date.now() - 4 * 3600e3).toISOString(), route: 'Tangerang → Jakarta', fare: 95000, status: 'completed' },
        ],
        walletBalance: 350000,
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [driverId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async () => {
    setActionBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setDriver((prev) => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }));
      setToast({ variant: 'success', message: `Status driver ${driver?.status === 'active' ? 'ditangguhkan' : 'diaktifkan'}` });
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
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={8} /></div>
          <div style={{ flex: 1 }}><Skeleton variant="card" lines={4} /></div>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return <ErrorState title="Gagal memuat detail driver" description={`ID: ${driverId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <Avatar size="md" name={driver.name} />
          <div>
            <h2 className="admin-detail__title">{driver.name}</h2>
            <div className="admin-detail__sub">Driver sejak {new Date(driver.registeredAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <StatusIndicator tone={driver.status === 'active' ? 'success' : 'warning'} label={driver.status === 'active' ? 'Aktif' : 'Ditangguhkan'} pulse={driver.status === 'active'} />
          <Button variant={driver.status === 'active' ? 'warning' : 'success'} size="sm" onClick={handleToggleStatus} disabled={actionBusy}>
            {driver.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
          </Button>
        </div>
      </div>

      <div className="admin-detail__grid">
        {/* Left column */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Informasi Driver</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Mail size={14} /><span>{driver.email}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Phone size={14} /><span>{driver.phone}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} /><span>Bergabung {new Date(driver.registeredAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Clock size={14} /><span>Terakhir aktif {new Date(driver.lastActive).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Kendaraan</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Truck size={14} /><span>{driver.vehicleType} · {driver.vehiclePlate}</span>
                </div>
                <div className="admin-detail__info-row">
                  <span style={{ marginLeft: 22 }}>{driver.vehicleBrand} {driver.vehicleModel} ({driver.vehicleYear})</span>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Verifikasi & Lisensi</h3>
              <div className="admin-detail__verif" style={{ marginBottom: 10 }}>
                <Badge variant={driver.kycVerified ? 'success' : 'neutral'} size="sm">
                  {driver.kycVerified ? <CheckCircle size={10} /> : <XCircle size={10} />} KYC
                </Badge>
                <Badge variant={driver.emailVerified ? 'success' : 'neutral'} size="sm">
                  {driver.emailVerified ? <CheckCircle size={10} /> : <XCircle size={10} />} Email
                </Badge>
                <Badge variant={driver.phoneVerified ? 'success' : 'neutral'} size="sm">
                  {driver.phoneVerified ? <CheckCircle size={10} /> : <XCircle size={10} />} Telepon
                </Badge>
              </div>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <FileText size={14} /><span>{driver.licenseNumber}</span>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} /><span>Berlaku hingga {new Date(driver.licenseExpiry).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Kinerja</h3>
              <div className="admin-detail__stats">
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{driver.totalTrips}</div>
                  <div className="admin-detail__stat-label">Total Trip</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{driver.acceptanceRate}%</div>
                  <div className="admin-detail__stat-label">Acceptance</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">{driver.completionRate}%</div>
                  <div className="admin-detail__stat-label">Completion</div>
                </div>
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {driver.rating} <Star size={14} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="admin-detail__stat-label">Rating</div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Tautan Cepat</h3>
              <div className="admin-detail__quick-actions">
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverTrips', driver.id)}>
                  <Map size={16} /> Riwayat Trip
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverWallet', driver.id)}>
                  <Wallet size={16} /> Dompet (Rp {driver.walletBalance.toLocaleString('id-ID')})
                </button>
                <button className="admin-detail__quick-btn" onClick={() => onNavigate?.('driverSupport', driver.id)}>
                  <MessageSquare size={16} /> Support
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column — Recent Trips */}
        <div>
          <Card>
            <div className="admin-detail__section">
              <div className="admin-detail__section-header">
                <h3 className="admin-detail__section-title">Trip Terbaru</h3>
                <button className="admin-section__action" onClick={() => onNavigate?.('driverTrips', driver.id)}>Lihat Semua</button>
              </div>
              {driver.recentTrips.map((trip) => (
                <div key={trip.id} className="admin-detail__trip">
                  <div className="admin-detail__trip-route">{trip.route}</div>
                  <div className="admin-detail__trip-meta">
                    <span>{new Date(trip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Rp {trip.fare.toLocaleString('id-ID')}</span>
                    <Badge variant={trip.status === 'completed' ? 'success' : 'warning'} size="sm">{trip.status}</Badge>
                  </div>
                </div>
              ))}
              {driver.recentTrips.length === 0 && <div className="admin-cust__empty">Belum ada trip.</div>}
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Pendapatan</h3>
              <div className="admin-detail__stats">
                <div className="admin-detail__stat">
                  <div className="admin-detail__stat-value">Rp {driver.totalEarnings.toLocaleString('id-ID')}</div>
                  <div className="admin-detail__stat-label">Total Pendapatan</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
