import React from 'react';
import { Card, Text, Badge, Flex } from '../../design-system/index.js';
import { MapPin, Navigation, Clock } from 'lucide-react';

const STATUS_LABEL = {
  created: 'Dibuat', driver_en_route: 'Menuju', driver_arrived: 'Tiba',
  passenger_boarding: 'Naik', started: 'Mulai', in_progress: 'Berjalan',
  waiting: 'Menunggu', completed: 'Selesai', cancelled: 'Dibatalkan',
};
const STATUS_TONE = {
  created: 'info', driver_en_route: 'primary', driver_arrived: 'primary',
  passenger_boarding: 'primary', started: 'primary', in_progress: 'primary',
  waiting: 'warning', completed: 'success', cancelled: 'danger',
};

export default function TripCard({ trip, onClick, compact }) {
  if (!trip) return null;
  const st = STATUS_LABEL[trip.status] || trip.status;
  const tone = STATUS_TONE[trip.status] || 'info';
  const pickup = trip.pickup?.address || trip.origin || trip.pickup || '—';
  const dest = trip.destination?.address || trip.dropoff || trip.destination || '—';

  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, marginBottom: 8, borderLeft: trip.status === 'in_progress' ? '4px solid var(--ds-color-primary)' : undefined }}
    >
      {!compact && (
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text size="xs" color="muted">Trip #{trip.trip_code || trip.id?.slice(0, 8) || ''}</Text>
          <Badge variant={tone} size="sm">{st}</Badge>
        </Flex>
      )}
      <Flex gap={8} style={{ alignItems: 'flex-start' }}>
        <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ds-color-success)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickup}</Text>
        </div>
      </Flex>
      <Flex gap={8} style={{ alignItems: 'flex-start', marginTop: 4 }}>
        <Navigation size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ds-color-danger)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest}</Text>
        </div>
      </Flex>
      <Flex gap={12} style={{ marginTop: 6 }}>
        {trip.final_fare > 0 && (
          <Text size="xs" weight="bold" color="success">
            Rp {(trip.final_fare || 0).toLocaleString('id-ID')}
          </Text>
        )}
        {trip.created_at && (
          <Flex gap={4} style={{ alignItems: 'center' }}>
            <Clock size={12} color="var(--ds-color-text-muted)" />
            <Text size="xs" color="muted">
              {new Date(trip.created_at).toLocaleDateString('id-ID')}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
