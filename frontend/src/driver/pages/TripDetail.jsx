import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Heading, Badge, Flex, Loading, ErrorState } from '../../design-system/index.js';
import { ChevronLeft, MapPin, Navigation, Clock, User, DollarSign, Phone, MessageCircle } from 'lucide-react';
import { driverAPI } from '../driver-api.js';

export default function TripDetail({ trip: propTrip, onBack }) {
  const [trip, setTrip] = useState(propTrip || null);
  const [loading, setLoading] = useState(!propTrip);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!propTrip && propTrip?.id) {
      driverAPI.trip(propTrip.id).then(setTrip).catch(() => setError(true)).finally(() => setLoading(false));
    }
  }, [propTrip]);

  if (loading) return <div style={{ padding: 40 }}><Loading /></div>;
  if (error) return <ErrorState title="Gagal memuat" description="Tidak dapat memuat detail perjalanan." onRetry={() => window.location.reload()} />;
  if (!trip) return null;

  const pickup = trip.pickup?.address || trip.origin || '—';
  const dest = trip.destination?.address || trip.dropoff || '—';
  const customerName = trip.customer?.name || trip.customer_name || '—';

  return (
    <div className="drv-trip-detail">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Detail Perjalanan</h2>
      </header>

      <div className="drv-page-body">
        <Card style={{ marginBottom: 16 }}>
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text size="sm" weight="bold">Trip #{trip.trip_code || trip.id?.slice(0, 8)}</Text>
            <Badge variant={trip.status === 'completed' ? 'success' : trip.status === 'cancelled' ? 'danger' : 'info'}>
              {trip.status}
            </Badge>
          </Flex>

          <Flex gap={8} style={{ alignItems: 'flex-start', marginBottom: 8 }}>
            <MapPin size={16} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ds-color-success)' }} />
            <div><Text size="sm">{pickup}</Text></div>
          </Flex>
          <Flex gap={8} style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            <Navigation size={16} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ds-color-danger)' }} />
            <div><Text size="sm">{dest}</Text></div>
          </Flex>

          <div style={{ borderTop: '1px solid var(--ds-color-border)', paddingTop: 12 }}>
            <Flex gap={8} style={{ alignItems: 'center', marginBottom: 6 }}>
              <User size={14} color="var(--ds-color-text-muted)" />
              <Text size="sm">{customerName}</Text>
            </Flex>
            {trip.final_fare > 0 && (
              <Flex gap={8} style={{ alignItems: 'center', marginBottom: 6 }}>
                <DollarSign size={14} color="var(--ds-color-success)" />
                <Text size="sm" weight="bold">Rp {(trip.final_fare || 0).toLocaleString('id-ID')}</Text>
              </Flex>
            )}
            {trip.created_at && (
              <Flex gap={8} style={{ alignItems: 'center' }}>
                <Clock size={14} color="var(--ds-color-text-muted)" />
                <Text size="xs" color="muted">{new Date(trip.created_at).toLocaleString('id-ID')}</Text>
              </Flex>
            )}
          </div>
        </Card>

        {trip.status === 'completed' && (
          <Card style={{ marginBottom: 16 }}>
            <Heading size="xs" style={{ marginBottom: 12 }}>Aksi</Heading>
            <Flex gap={8}>
              <Button variant="secondary" size="sm"><Phone size={14} style={{ marginRight: 4 }} />Hubungi</Button>
              <Button variant="secondary" size="sm"><MessageCircle size={14} style={{ marginRight: 4 }} />Chat</Button>
            </Flex>
          </Card>
        )}
      </div>
    </div>
  );
}
