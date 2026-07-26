import React, { useState, useEffect, useRef } from 'react';
import { Text, Heading, Flex, Button } from '../../design-system/index.js';
import { MapPin, Navigation, DollarSign, Clock, User } from 'lucide-react';

export default function IncomingOrders({ order, onAccept, onReject, onTimeout }) {
  const [countdown, setCountdown] = useState(30);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!order) return;
    setCountdown(30);
    timer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer.current);
          onTimeout?.();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [order?.id]);

  useEffect(() => {
    if (!order || typeof Audio === 'undefined') return;
    const audio = new Audio();
    const beep = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9';
    audio.src = beep;
    audio.loop = true;
    audio.play().catch(() => {});
    return () => { audio.loop = false; audio.pause(); audio.src = ''; };
  }, [order?.id]);

  if (!order) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(order.id);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(order.id);
    } finally {
      setRejecting(false);
    }
  };

  const circleSize = 80;
  const circumference = 2 * Math.PI * (circleSize / 2 - 4);
  const progress = (countdown / 30) * circumference;

  return (
    <div className="drv-incoming-overlay">
      <div className="drv-incoming-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2 - 4}
              fill="none" stroke="var(--ds-color-border)" strokeWidth={4} />
            <circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2 - 4}
              fill="none" stroke="var(--ds-color-primary)" strokeWidth={4}
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              strokeLinecap="round" />
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: 24, fontWeight: 700,
          }}>{countdown}</div>
        </div>

        <Heading size="sm" style={{ textAlign: 'center', marginBottom: 4 }}>Pesanan Baru!</Heading>
        <Text size="xs" color="muted" style={{ textAlign: 'center', marginBottom: 16 }}>
          {order.type === 'delivery' ? 'Delivery' : 'Transport'}
        </Text>

        <div className="drv-incoming-route" style={{ marginBottom: 16 }}>
          <div className="drv-incoming-route__item">
            <MapPin size={16} color="var(--ds-color-success)" />
            <div style={{ marginLeft: 8 }}>
              <Text size="xs" color="muted">Pickup</Text>
              <Text size="sm" weight="bold">{order.pickupLabel || order.pickup_address || 'Lokasi Anda'}</Text>
            </div>
          </div>
          <div className="drv-incoming-route__line" />
          <div className="drv-incoming-route__item">
            <Navigation size={16} color="var(--ds-color-danger)" />
            <div style={{ marginLeft: 8 }}>
              <Text size="xs" color="muted">Tujuan</Text>
              <Text size="sm" weight="bold">{order.destinationLabel || order.destination_address || 'Tujuan'}</Text>
            </div>
          </div>
        </div>

        <Flex gap={16} style={{ marginBottom: 16, justifyContent: 'center' }}>
          {order.estimated_fare > 0 && (
            <div style={{ textAlign: 'center' }}>
              <DollarSign size={16} color="var(--ds-color-success)" style={{ margin: '0 auto 2px' }} />
              <Text size="xs" color="muted">Estimasi</Text>
              <Text size="sm" weight="bold">Rp {Number(order.estimated_fare).toLocaleString('id-ID')}</Text>
            </div>
          )}
          {order.distance && (
            <div style={{ textAlign: 'center' }}>
              <Navigation size={16} color="var(--ds-color-primary)" style={{ margin: '0 auto 2px' }} />
              <Text size="xs" color="muted">Jarak</Text>
              <Text size="sm" weight="bold">{order.distance} km</Text>
            </div>
          )}
          {order.estimated_duration && (
            <div style={{ textAlign: 'center' }}>
              <Clock size={16} color="var(--ds-color-warning)" style={{ margin: '0 auto 2px' }} />
              <Text size="xs" color="muted">Estimasi</Text>
              <Text size="sm" weight="bold">{order.estimated_duration} mnt</Text>
            </div>
          )}
        </Flex>

        {order.passenger && (
          <Flex gap={8} style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <User size={14} color="var(--ds-color-text-muted)" />
            <Text size="xs" color="muted">{order.passenger.name || 'Penumpang'}</Text>
            {order.passenger.rating > 0 && (
              <Text size="xs" color="muted">★ {order.passenger.rating.toFixed(1)}</Text>
            )}
          </Flex>
        )}

        <Flex gap={12}>
          <Button variant="outline" onClick={handleReject} disabled={accepting || rejecting} style={{ flex: 1 }}>
            {rejecting ? '...' : 'Tolak'}
          </Button>
          <Button variant="primary" onClick={handleAccept} disabled={accepting || rejecting} style={{ flex: 1 }}>
            {accepting ? 'Menerima...' : 'Terima'}
          </Button>
        </Flex>
      </div>
    </div>
  );
}
