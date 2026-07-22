import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Button, EmptyState, StatusIndicator,
} from '../design-system/index.js';
import {
  Map, Navigation, RefreshCw, User, Truck, Clock, MapPin,
} from 'lucide-react';
import { occApi } from './occ-api.js';

export default function LiveTrips({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await occApi.liveTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setTrips([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusProps = (status) => {
    switch (status) {
      case 'in_progress': return { tone: 'info', pulse: true, label: 'Dalam Perjalanan' };
      case 'arrived': return { tone: 'success', pulse: true, label: 'Sampai' };
      case 'picked_up': return { tone: 'warning', pulse: true, label: 'Penumpang Naik' };
      case 'pending': return { tone: 'neutral', label: 'Menunggu' };
      default: return { tone: 'neutral', label: status };
    }
  };

  if (loading) {
    return (
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title">Live Trips</h2>
        </div>
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16, marginBottom: 8 }}>
              <Skeleton variant="rect" height={16} width="30%" radius="sm" />
              <Skeleton variant="rect" height={12} width="60%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat live trips"
        description="Tidak dapat terhubung ke server."
        onRetry={load}
      />
    );
  }

  return (
    <div className="occ-section">
      <div className="occ-section__header">
        <h2 className="occ-section__title">
          <Map size={16} style={{ marginRight: 6 }} />
          Live Trip Monitoring
        </h2>
        <button type="button" className="occ-section__action" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Muat ulang
        </button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <EmptyState
            icon={Map}
            title="Tidak ada trip aktif"
            description="Semua trip sudah selesai atau belum ada pesanan."
          />
        </Card>
      ) : (
        <div className="occ-trip-list">
          {trips.map((trip) => {
            const sp = statusProps(trip.status);
            return (
              <div key={trip.id} className="occ-trip-card">
                <div className="occ-trip-card__header">
                  <div className="occ-trip-card__id">Trip #{trip.id}</div>
                  <StatusIndicator tone={sp.tone} pulse={sp.pulse} />
                  <Badge variant={sp.tone} size="sm">{sp.label}</Badge>
                </div>
                <div className="occ-trip-card__body">
                  <div className="occ-trip-card__row">
                    <Truck size={14} />
                    <span>Driver: {trip.driver_name || trip.driver_id || '-'}</span>
                  </div>
                  <div className="occ-trip-card__row">
                    <User size={14} />
                    <span>Customer: {trip.customer_name || trip.customer_id || '-'}</span>
                  </div>
                  {trip.pickup_location && (
                    <div className="occ-trip-card__row">
                      <MapPin size={14} />
                      <span>{trip.pickup_location}</span>
                    </div>
                  )}
                  {trip.destination_location && (
                    <div className="occ-trip-card__row">
                      <Navigation size={14} />
                      <span>{trip.destination_location}</span>
                    </div>
                  )}
                  {trip.started_at && (
                    <div className="occ-trip-card__row">
                      <Clock size={14} />
                      <span>{new Date(trip.started_at).toLocaleTimeString()}</span>
                    </div>
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
