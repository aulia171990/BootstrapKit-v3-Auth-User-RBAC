import React, { useState, useEffect, useCallback } from 'react';
import {
  Icon, Card, Badge, Skeleton, ErrorState, Loading, Button, MetricWidget, KPICard, StatusIndicator,
  ActivityFeed, EmptyState, Sparkline,
} from '../design-system/index.js';
import {
  Users, Truck, Map, CheckCircle, XCircle, DollarSign, Calendar, Clock, Star,
  Activity, Navigation, Bell, AlertTriangle, Info, AlertCircle, RefreshCw,
  TrendingUp, UserPlus, CreditCard, RotateCcw, WifiOff,
} from 'lucide-react';
import { api } from '../api.js';
import './admin.css';

const DEMO_STATS = {
  activeDrivers: 48, onlineDrivers: 32, activeTrips: 12, completedTripsToday: 87,
  cancelledTrips: 6, revenueToday: 28750000, bookingsToday: 124, avgEta: 4.2,
  customerSatisfaction: 4.7,
  tripsInProgress: 12, driversWaiting: 8, pendingDispatch: 3, sosAlerts: 1, incidents: 0,
  revenueTrend: [120, 145, 138, 170, 190, 210, 240, 225, 260, 275, 260, 287],
  bookingTrend: [40, 55, 48, 62, 70, 80, 75, 90, 95, 88, 105, 124],
  activeDriversTrend: [35, 38, 40, 42, 39, 44, 46, 43, 47, 48, 45, 48],
  activeTripsTrend: [8, 10, 7, 12, 9, 11, 14, 10, 13, 12, 15, 12],
};

const DEMO_ALERTS = [
  { id: 'a1', type: 'critical', message: 'SOS from driver AG-1234', time: '2m ago' },
  { id: 'a2', type: 'warning', message: 'Driver AG-5678 offline for 30 min during trip', time: '5m ago' },
  { id: 'a3', type: 'info', message: 'Peak hour — 15% surge in Central Jakarta', time: '10m ago' },
  { id: 'a4', type: 'info', message: '5 new drivers approved today', time: '15m ago' },
];

const DEMO_ACTIVITIES = [
  { id: 'act1', user: 'Budi Santoso', action: 'mendaftar sebagai', target: 'Driver', time: '2m ago' },
  { id: 'act2', user: 'Siti Rahmawati', action: 'menyelesaikan', target: 'Trip #TR-8921', time: '5m ago' },
  { id: 'act3', user: 'Ahmad Fauzi', action: 'melakukan top-up', target: 'Rp 100.000', time: '7m ago' },
  { id: 'act4', user: 'Dewi Lestari', action: 'mendaftar sebagai', target: 'Customer', time: '12m ago' },
  { id: 'act5', user: 'System', action: 'refund', target: 'Trip #TR-8890 — Rp 45.000', time: '15m ago' },
  { id: 'act6', user: 'Rudi Hermawan', action: 'menyelesaikan', target: 'Trip #TR-8915', time: '20m ago' },
];

const ALERT_ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

export default function DashboardHome({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const d = await api.dashboardStats();
      setStats({ ...DEMO_STATS, ...(d || {}) });
    } catch { setError(true); setStats(DEMO_STATS); }
    finally { setLoading(false); }
  }, [offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-kpi-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16 }}>
              <Skeleton variant="rect" height={14} width="60%" radius="sm" />
              <Skeleton variant="rect" height={28} width="80%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        description="Tidak dapat terhubung ke server. Periksa koneksi Anda."
        onRetry={load}
      />
    );
  }

  if (offline && !stats) {
    return (
      <EmptyState icon={WifiOff} title="Mode offline" description="Data dashboard tidak tersedia saat offline." />
    );
  }

  const s = stats || DEMO_STATS;

  return (
    <div>
      {/* KPI Cards */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Ringkasan Hari Ini</h2>
          <button type="button" className="admin-section__action" onClick={load}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
        </div>
        <div className="admin-kpi-grid">
          <KPICard icon={Truck} label="Driver Aktif" value={s.activeDrivers} tone="primary" />
          <KPICard icon={Users} label="Driver Online" value={s.onlineDrivers} tone="success" />
          <KPICard icon={Map} label="Trip Aktif" value={s.activeTrips} tone="info" />
          <KPICard icon={CheckCircle} label="Trip Selesai" value={s.completedTripsToday} tone="success" />
          <KPICard icon={XCircle} label="Trip Batal" value={s.cancelledTrips} tone="danger" />
          <KPICard icon={DollarSign} label="Revenue Hari Ini" value={s.revenueToday ? `Rp ${s.revenueToday.toLocaleString('id-ID')}` : 'Rp 0'} tone="primary" />
          <KPICard icon={Calendar} label="Booking Hari Ini" value={s.bookingsToday} tone="info" />
          <KPICard icon={Clock} label="Rata-rata ETA" value={`${s.avgEta} mnt`} tone="warning" />
          <KPICard icon={Star} label="Kepuasan Pelanggan" value={s.customerSatisfaction} tone="success" suffix="/5" />
        </div>
      </div>

      {/* Live Operations + Alerts + Activity */}
      <div className="admin-dash-grid">
        <div>
          {/* Live Operations */}
          <div className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Operasi Langsung</h2>
            </div>
            <div className="admin-live-ops">
              <div className="admin-live-ops__item">
                <StatusIndicator tone="info" pulse />
                <div className="admin-live-ops__value">{s.tripsInProgress}</div>
                <div className="admin-live-ops__label">Trip Berlangsung</div>
              </div>
              <div className="admin-live-ops__item">
                <StatusIndicator tone="success" pulse />
                <div className="admin-live-ops__value">{s.driversWaiting}</div>
                <div className="admin-live-ops__label">Driver Tersedia</div>
              </div>
              <div className="admin-live-ops__item">
                <StatusIndicator tone="warning" />
                <div className="admin-live-ops__value">{s.pendingDispatch}</div>
                <div className="admin-live-ops__label">Menunggu Dispatch</div>
              </div>
              <div className="admin-live-ops__item">
                <StatusIndicator tone={s.sosAlerts > 0 ? 'danger' : 'neutral'} pulse={s.sosAlerts > 0} />
                <div className="admin-live-ops__value" style={{ color: s.sosAlerts > 0 ? 'var(--ds-color-danger)' : undefined }}>{s.sosAlerts}</div>
                <div className="admin-live-ops__label">SOS Alert</div>
              </div>
              <div className="admin-live-ops__item">
                <StatusIndicator tone="neutral" />
                <div className="admin-live-ops__value">{s.incidents}</div>
                <div className="admin-live-ops__label">Insiden</div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Ringkasan Revenue</h2>
              <button type="button" className="admin-section__action" onClick={() => onNavigate?.('payments')}>Lihat Semua</button>
            </div>
            <Card>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Revenue Bulan Ini</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ds-color-text-strong)' }}>Rp {(s.revenueToday * 30).toLocaleString('id-ID')}</div>
                  </div>
                  <Badge variant="success" size="sm">
                    <TrendingUp size={12} /> +{(s.revenueTrend?.[s.revenueTrend.length - 1] / s.revenueTrend?.[0] * 100 - 100).toFixed(0)}%
                  </Badge>
                </div>
                {s.revenueTrend && (
                  <Sparkline data={s.revenueTrend} color="var(--ds-color-primary)" width="100%" height={48} />
                )}
              </div>
            </Card>
          </div>

          {/* Summary Grid */}
          <div className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Ringkasan Layanan</h2>
            </div>
            <div className="admin-summary-grid">
              <div className="admin-summary-stat">
                <div className="admin-summary-stat__label">Total Booking</div>
                <div className="admin-summary-stat__value">{s.bookingsToday}</div>
                <div className="admin-summary-stat__sub">{s.completedTripsToday} selesai</div>
              </div>
              <div className="admin-summary-stat">
                <div className="admin-summary-stat__label">Driver</div>
                <div className="admin-summary-stat__value">{s.activeDrivers}</div>
                <div className="admin-summary-stat__sub">{s.onlineDrivers} online</div>
              </div>
              <div className="admin-summary-stat">
                <div className="admin-summary-stat__label">Pelanggan</div>
                <div className="admin-summary-stat__value">1,247</div>
                <div className="admin-summary-stat__sub">+12 hari ini</div>
              </div>
              <div className="admin-summary-stat">
                <div className="admin-summary-stat__label">Rating</div>
                <div className="admin-summary-stat__value">{s.customerSatisfaction}</div>
                <div className="admin-summary-stat__sub">/5.0 dari 873 ulasan</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Recent Alerts */}
          <div className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Notifikasi & Alert</h2>
            </div>
            <Card>
              <div className="admin-alert-list">
                {DEMO_ALERTS.map((a) => {
                  const AlertIcon = ALERT_ICONS[a.type] || Info;
                  return (
                    <div key={a.id} className={`admin-alert-item admin-alert-item--${a.type}`}>
                      <AlertIcon size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span className="admin-alert-item__msg">{a.message}</span>
                      <span className="admin-alert-item__time">{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Aktivitas Terbaru</h2>
            </div>
            <Card>
              <ActivityFeed items={DEMO_ACTIVITIES.map((a) => ({
                id: a.id, user: a.user, action: a.action, target: a.target, time: a.time,
              }))} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
