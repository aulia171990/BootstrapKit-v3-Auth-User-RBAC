import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Button, EmptyState,
} from '../design-system/index.js';
import { AlertTriangle, RefreshCw, Phone, MapPin, User, Clock } from 'lucide-react';
import { occApi } from './occ-api.js';

export default function SOSPanel({ onNavigate }) {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await occApi.sosAlerts();
      setSosList(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setSosList([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title occ-section__title--danger">SOS Alerts</h2>
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16, marginBottom: 8 }}>
              <Skeleton variant="rect" height={16} width="50%" radius="sm" />
              <Skeleton variant="rect" height={12} width="30%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat SOS"
        description="Tidak dapat terhubung ke server."
        onRetry={load}
      />
    );
  }

  return (
    <div className="occ-section">
      <div className="occ-section__header">
        <h2 className="occ-section__title occ-section__title--danger">
          <AlertTriangle size={16} style={{ marginRight: 6 }} />
          SOS Monitoring
        </h2>
        <button type="button" className="occ-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      {sosList.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Tidak ada SOS aktif"
            description="Semua driver dalam keadaan aman."
          />
        </Card>
      ) : (
        <div className="occ-sos-list">
          {sosList.map((sos) => (
            <div key={sos.id} className="occ-sos-card">
              <div className="occ-sos-card__header">
                <Badge variant="danger" size="sm" pulse>SOS AKTIF</Badge>
                <span className="occ-sos-card__time">
                  <Clock size={12} />
                  {sos.created_at ? new Date(sos.created_at).toLocaleString() : ''}
                </span>
              </div>
              <div className="occ-sos-card__body">
                <div className="occ-sos-card__row">
                  <User size={14} />
                  <span>Driver: {sos.driver_name || sos.driver_id || 'Unknown'}</span>
                </div>
                {sos.location && (
                  <div className="occ-sos-card__row">
                    <MapPin size={14} />
                    <span>{sos.location}</span>
                  </div>
                )}
                {sos.message && (
                  <div className="occ-sos-card__msg">{sos.message}</div>
                )}
              </div>
              <div className="occ-sos-card__actions">
                <Button size="sm" variant="danger">
                  <Phone size={12} style={{ marginRight: 4 }} />
                  Hubungi
                </Button>
                <Button size="sm" variant="secondary">
                  <MapPin size={12} style={{ marginRight: 4 }} />
                  Lihat Peta
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
