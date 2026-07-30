import React, { useState, useCallback } from 'react';
import { Card, Text, Heading, Flex, Button } from '../../design-system/index.js';
import { MapPin, Navigation, Phone, MessageSquare, CheckCircle, X, ChevronLeft } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

const STEPS = [
  { key: 'accepted', label: 'Menuju Penumpang', desc: 'Ambil pesanan di lokasi pickup' },
  { key: 'ongoing', label: 'Dalam Perjalanan', desc: 'Trip berjalan' },
  { key: 'completed', label: 'Selesai', desc: 'Trip selesai' },
];

export default function ActiveTrip({ trip: initialTrip, onBack, onUpdate, tripStore: store }) {
  const [trip, setTrip] = useState(initialTrip);
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const currentStepIdx = STEPS.findIndex((s) => s.key === trip?.status);
  const currentStep = currentStepIdx >= 0 ? STEPS[currentStepIdx] : null;
  const isCompleted = trip?.status === 'completed';
  const isAccepted = trip?.status === 'accepted';
  const isOngoing = trip?.status === 'ongoing';

  const advanceStep = useCallback(async (status, payload = {}) => {
    setLoading(true);
    try {
      await (store || { updateStatus: async () => {} }).updateStatus(trip.id, status);
      setTrip((prev) => ({ ...prev, ...payload, status }));
      onUpdate?.({ ...trip, ...payload, status });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [trip?.id, store, onUpdate]);

  const handleArrived = () => advanceStep('arrived', { arrived_at: new Date().toISOString() });
  const handleStartTrip = () => advanceStep('in_progress', { started_at: new Date().toISOString() });
  const handleComplete = () => advanceStep('completed', { completed_at: new Date().toISOString() });
  const verifyCode = () => {
    if (codeInput === (trip.pickup_code || '')) {
      setCodeError('');
      handleArrived();
    } else {
      setCodeError('Kode pickup salah');
    }
  };

  const handleCancel = () => setShowCancelModal(true);
  const confirmCancel = () => {
    advanceStep('cancelled');
    setShowCancelModal(false);
  };

  if (!trip) {
    return (
      <div className="drv-page">
        <header className="drv-page-header">
          <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Trip Aktif</h2>
        </header>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Text color="muted">Tidak ada trip aktif</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="drv-active-trip">
      <header className="drv-active-trip__header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <Heading size="xs">{currentStep?.label || 'Trip Aktif'}</Heading>
          <Text size="xs" color="muted">{trip.type === 'delivery' ? 'Delivery' : 'Transport'} · #{trip.id?.slice(0, 8)}</Text>
        </div>
        {!isCompleted && (
          <Button variant="ghost" size="sm" style={{ color: 'var(--ds-color-danger)' }}
            onClick={handleCancel}><X size={16} /></Button>
        )}
      </header>

      <div className="drv-active-trip__map">
        <div style={{
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--ds-color-surface-2, #e8ecf1)', flexDirection: 'column', gap: 8,
        }}>
          <Navigation size={48} color="var(--ds-color-text-muted)" />
          <Text color="muted">Peta akan ditampilkan di sini</Text>
        </div>
      </div>

      <div className="drv-active-trip__body">
        <div className="drv-step-indicator">
          {STEPS.map((step, i) => (
            <div key={step.key} className={`drv-step ${i <= currentStepIdx ? 'drv-step--active' : ''} ${i < currentStepIdx ? 'drv-step--done' : ''}`}>
              <div className="drv-step__dot">
                {i < currentStepIdx ? <CheckCircle size={16} /> : i + 1}
              </div>
              <Text size="xs" color={i <= currentStepIdx ? 'default' : 'muted'}>{step.label}</Text>
            </div>
          ))}
        </div>

        <div className="drv-active-trip__route">
          <div className="drv-route-item">
            <MapPin size={20} color="var(--ds-color-success)" />
            <div>
              <Text size="xs" color="muted">Pickup</Text>
              <Text size="sm" weight="bold">{trip.pickupLabel || trip.pickup_address || 'Lokasi pickup'}</Text>
            </div>
          </div>
          <div className="drv-route-line" />
          <div className="drv-route-item">
            <Navigation size={20} color="var(--ds-color-danger)" />
            <div>
              <Text size="xs" color="muted">Tujuan</Text>
              <Text size="sm" weight="bold">{trip.destinationLabel || trip.destination_address || 'Lokasi tujuan'}</Text>
            </div>
          </div>
        </div>

        <Flex gap={12} style={{ marginBottom: 16 }}>
          <Button variant="outline" size="sm" style={{ flex: 1 }}>
            <Phone size={14} /> Telepon
          </Button>
          <Button variant="outline" size="sm" style={{ flex: 1 }}>
            <MessageSquare size={14} /> Chat
          </Button>
        </Flex>

        <Flex gap={12} style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" color="muted">Tarif</Text>
            <Text size="sm" weight="bold">Rp {Number(trip.estimated_fare || trip.fare || 0).toLocaleString('id-ID')}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" color="muted">Jarak</Text>
            <Text size="sm" weight="bold">{trip.distance || '—'} km</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" color="muted">Pembayaran</Text>
            <Text size="sm" weight="bold">{trip.payment_method === 'cash' ? 'Tunai' : 'Dompet'}</Text>
          </div>
        </Flex>

        {!isCompleted && (
          <>
            {isAccepted && (
              <Button variant="primary" style={{ width: '100%', marginTop: 8 }}
                onClick={handleStartTrip} disabled={loading}>
                {loading ? 'Memproses...' : 'Mulai Perjalanan'}
              </Button>
            )}

            {isOngoing && (
              <Button variant="primary" style={{ width: '100%', marginTop: 8, background: 'var(--ds-color-success)' }}
                onClick={handleComplete} disabled={loading}>
                {loading ? 'Memproses...' : 'Selesai'}
              </Button>
            )}
          </>
        )}

        {isCompleted && (
          <Card style={{ textAlign: 'center', background: 'var(--ds-color-success-bg, #ecfdf5)' }}>
            <CheckCircle size={32} color="var(--ds-color-success)" style={{ margin: '0 auto 8px' }} />
            <Heading size="sm">Trip Selesai</Heading>
            <Text size="sm" color="muted">Terima kasih! Trip telah selesai.</Text>
            <Button variant="primary" style={{ marginTop: 12 }} onClick={onBack}>Kembali</Button>
          </Card>
        )}

        <ConfirmationModal
          title="Batalkan Trip"
          message="Yakin ingin membatalkan trip ini? Penumpang akan diberitahu."
          onConfirm={confirmCancel}
          onClose={() => setShowCancelModal(false)}
        />
      </div>
    </div>
  );
}