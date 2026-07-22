import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Loading, Button,
  KPICard, StatusIndicator, ActivityFeed, EmptyState,
} from '../design-system/index.js';
import {
  Truck, Map, CheckCircle, XCircle, DollarSign, Users,
  Clock, AlertTriangle, AlertCircle, Info, RefreshCw,
  Radio, Navigation, Bell,
} from 'lucide-react';
import { occApi } from './occ-api.js';

const DEMO_OPS = {
  activeDrivers: 48, onlineDrivers: 32, busyDrivers: 12, offlineDrivers: 4,
  activeTrips: 12, completedToday: 87, cancelledToday: 6,
  pendingDispatch: 3, sosAlerts: 1, incidents: 0,
  avgResponseTime: 4.2, avgTripDuration: 18,
};

const DEMO_ALERTS = [
  { id: 'a1', type: 'critical', icon: AlertTriangle, message: 'SOS from driver AG-1234', time: '2m ago' },
  { id: 'a2', type: 'warning', icon: AlertCircle, message: 'Driver AG-5678 offline for 30 min during trip', time: '5m ago' },
  { id: 'a3', type: 'info', icon: Info, message: 'Peak hour — 15% surge in Central Jakarta', time: '10m ago' },
  { id: 'a4', type: 'info', icon: Info, message: '5 new drivers approved today', time: '15m ago' },
];

const ALERT_ICONS = { critical: AlertTriangle, warning: AlertCircle, info: Info };

export default function OCCHome({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [ops, sos, alerts] = await Promise.all([
        occApi.dashboard().catch(() => null),
        occApi.sosAlerts().catch(() => null),
        occApi.alerts().catch(() => null),
      ]);
      setData({
        ops: { ...DEMO_OPS, ...(ops || {}) },
        sosAlerts: Array.isArray(sos) ? sos : [],
        alerts: Array.isArray(alerts) ? alerts : DEMO_ALERTS,
      });
    } catch {
      setError(true);
      setData({ ops: DEMO_OPS, sosAlerts: [], alerts: DEMO_ALERTS });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div>
        <div className="occ-kpi-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16 }}>
              <Skeleton variant="rect" height={14} width="60%" radius="sm" />
              <Skeleton variant="rect" height={28} width="80%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        description="Tidak dapat terhubung ke server OCC."
        onRetry={load}
      />
    );
  }

  const s = data.ops;
  const alertList = data.alerts;

  return (
    <div>
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title">Ringkasan Operasional</h2>
          <button type="button" className="occ-section__action" onClick={load}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
        </div>
        <div className="occ-kpi-grid">
          <KPICard icon={Truck} label="Driver Online" value={s.onlineDrivers} tone="success" />
          <KPICard icon={Users} label="Driver Sibuk" value={s.busyDrivers} tone="warning" />
          <KPICard icon={Map} label="Trip Aktif" value={s.activeTrips} tone="info" />
          <KPICard icon={CheckCircle} label="Selesai Hari Ini" value={s.completedToday} tone="success" />
          <KPICard icon={XCircle} label="Batal" value={s.cancelledToday} tone="danger" />
          <KPICard icon={Clock} label="Rata-rata Respon" value={`${s.avgResponseTime} mnt`} tone="primary" />
          <KPICard icon={Radio} label="Menunggu Dispatch" value={s.pendingDispatch} tone="warning" />
          <KPICard icon={AlertTriangle} label="Insiden" value={s.incidents} tone="neutral" />
        </div>
      </div>

      <div className="occ-dash-grid">
        <div>
          <div className="occ-section">
            <div className="occ-section__header">
              <h2 className="occ-section__title">Status Langsung</h2>
            </div>
            <div className="occ-live-ops">
              <div className="occ-live-ops__item">
                <StatusIndicator tone="success" pulse />
                <div className="occ-live-ops__value">{s.onlineDrivers}</div>
                <div className="occ-live-ops__label">Driver Tersedia</div>
              </div>
              <div className="occ-live-ops__item">
                <StatusIndicator tone="warning" pulse />
                <div className="occ-live-ops__value">{s.busyDrivers}</div>
                <div className="occ-live-ops__label">Dalam Trip</div>
              </div>
              <div className="occ-live-ops__item">
                <StatusIndicator tone="info" />
                <div className="occ-live-ops__value">{s.offlineDrivers}</div>
                <div className="occ-live-ops__label">Offline</div>
              </div>
              <div className="occ-live-ops__item">
                <StatusIndicator tone={s.pendingDispatch > 0 ? 'warning' : 'neutral'} pulse={s.pendingDispatch > 0} />
                <div className="occ-live-ops__value">{s.pendingDispatch}</div>
                <div className="occ-live-ops__label">Pending Dispatch</div>
              </div>
              <div className="occ-live-ops__item">
                <StatusIndicator tone={s.sosAlerts > 0 ? 'danger' : 'neutral'} pulse={s.sosAlerts > 0} />
                <div className="occ-live-ops__value" style={{ color: s.sosAlerts > 0 ? 'var(--ds-color-danger)' : undefined }}>{s.sosAlerts}</div>
                <div className="occ-live-ops__label">SOS Alert</div>
              </div>
            </div>
          </div>

          {data.sosAlerts.length > 0 && (
            <div className="occ-section">
              <div className="occ-section__header">
                <h2 className="occ-section__title occ-section__title--danger">SOS Darurat</h2>
                <button type="button" className="occ-section__action" onClick={() => onNavigate('sos')}>
                  Lihat Semua
                </button>
              </div>
              <Card>
                <div className="occ-alert-list">
                  {data.sosAlerts.map((sos) => (
                    <div key={sos.id} className="occ-alert-item occ-alert-item--critical">
                      <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ds-color-danger)' }} />
                      <span className="occ-alert-item__msg">{sos.message || `SOS from driver ${sos.driver_id || 'unknown'}`}</span>
                      <span className="occ-alert-item__time">{sos.created_at ? new Date(sos.created_at).toLocaleTimeString() : ''}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div>
          <div className="occ-section">
            <div className="occ-section__header">
              <h2 className="occ-section__title">Alert & Notifikasi</h2>
            </div>
            <Card>
              <div className="occ-alert-list">
                {alertList.length === 0 ? (
                  <div className="occ-empty-alerts">
                    <Bell size={24} style={{ opacity: 0.3 }} />
                    <div style={{ fontSize: 13, color: 'var(--ds-color-text-muted)', marginTop: 4 }}>Tidak ada alert</div>
                  </div>
                ) : alertList.map((a) => {
                  const AlertIcon = ALERT_ICONS[a.type] || Info;
                  return (
                    <div key={a.id} className={`occ-alert-item occ-alert-item--${a.type}`}>
                      <AlertIcon size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span className="occ-alert-item__msg">{a.message}</span>
                      <span className="occ-alert-item__time">{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="occ-section">
            <div className="occ-section__header">
              <h2 className="occ-section__title">Aksi Cepat</h2>
            </div>
            <div className="occ-quick-actions">
              <button className="occ-quick-action" onClick={() => onNavigate('incidents')}>
                <AlertTriangle size={20} />
                <span>Buat Insiden</span>
              </button>
              <button className="occ-quick-action" onClick={() => onNavigate('dispatch')}>
                <Radio size={20} />
                <span>Dispatch Manual</span>
              </button>
              <button className="occ-quick-action" onClick={() => onNavigate('live-trips')}>
                <Map size={20} />
                <span>Live Map</span>
              </button>
              <button className="occ-quick-action" onClick={() => onNavigate('sos')}>
                <AlertCircle size={20} />
                <span>SOS Center</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
