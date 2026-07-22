import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Button, StatusIndicator, EmptyState,
} from '../design-system/index.js';
import { Truck, RefreshCw, MapPin, Wifi, WifiOff, User, Clock } from 'lucide-react';
import { occApi } from './occ-api.js';

export default function DriverStatus({ onNavigate }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await occApi.drivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setDrivers([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleForceOffline = async (id) => {
    if (!window.confirm('Paksa driver offline? Driver akan berhenti menerima order.')) return;
    try {
      await occApi.forceOffline(id);
      load();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  };

  const handleForceOnline = async (id) => {
    try {
      await occApi.forceOnline(id);
      load();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  };

  const statusProps = (driver) => {
    if (driver.is_online) {
      if (driver.on_trip) return { tone: 'warning', pulse: true, label: 'Dalam Trip' };
      return { tone: 'success', pulse: true, label: 'Online' };
    }
    return { tone: 'neutral', label: 'Offline' };
  };

  if (loading) {
    return (
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title">Driver Status</h2>
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16, marginBottom: 8 }}>
              <Skeleton variant="rect" height={16} width="30%" radius="sm" />
              <Skeleton variant="rect" height={12} width="50%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat driver"
        description="Tidak dapat terhubung ke server."
        onRetry={load}
      />
    );
  }

  return (
    <div className="occ-section">
      <div className="occ-section__header">
        <h2 className="occ-section__title">
          <Truck size={16} style={{ marginRight: 6 }} />
          Driver Status
        </h2>
        <button type="button" className="occ-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      {drivers.length === 0 ? (
        <Card>
          <EmptyState
            icon={Truck}
            title="Tidak ada driver"
            description="Belum ada driver terdaftar."
          />
        </Card>
      ) : (
        <div className="occ-driver-list">
          {drivers.map((driver) => {
            const sp = statusProps(driver);
            return (
              <div key={driver.id} className="occ-driver-card">
                <div className="occ-driver-card__header">
                  <div className="occ-driver-card__info">
                    <div className="occ-driver-card__name">
                      <User size={14} style={{ flexShrink: 0 }} />
                      <span>{driver.name || driver.email || 'Driver #' + driver.id}</span>
                    </div>
                    <StatusIndicator tone={sp.tone} pulse={sp.pulse} />
                    <Badge variant={sp.tone} size="sm">{sp.label}</Badge>
                  </div>
                  <div className="occ-driver-card__rating">
                    {driver.rating ? '★ ' + driver.rating.toFixed(1) : ''}
                  </div>
                </div>
                <div className="occ-driver-card__body">
                  <div className="occ-driver-card__row">
                    <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>ID: {driver.id}</span>
                    {driver.phone && <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>• {driver.phone}</span>}
                  </div>
                  {driver.vehicle && (
                    <div className="occ-driver-card__row">
                      <span style={{ fontSize: 13 }}>{driver.vehicle.plate || driver.vehicle.model || '-'}</span>
                    </div>
                  )}
                  {driver.location && (
                    <div className="occ-driver-card__row">
                      <MapPin size={13} style={{ color: 'var(--ds-color-text-muted)' }} />
                      <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{driver.location}</span>
                    </div>
                  )}
                  {driver.last_active_at && (
                    <div className="occ-driver-card__row">
                      <Clock size={13} style={{ color: 'var(--ds-color-text-muted)' }} />
                      <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                        Terakhir aktif: {new Date(driver.last_active_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="occ-driver-card__actions">
                  {driver.is_online ? (
                    <Button size="sm" variant="danger" onClick={() => handleForceOffline(driver.id)}>
                      <WifiOff size={12} style={{ marginRight: 4 }} />
                      Force Offline
                    </Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => handleForceOnline(driver.id)}>
                      <Wifi size={12} style={{ marginRight: 4 }} />
                      Force Online
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
