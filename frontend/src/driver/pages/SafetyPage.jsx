import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Heading, Flex, Loading, EmptyState } from '../../design-system/index.js';
import { ChevronLeft, AlertTriangle, Phone, MapPin, Shield, Users } from 'lucide-react';
import { driverAPI } from '../driver-api.js';

export default function SafetyPage({ onBack }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverAPI.emergencyContacts().then(setContacts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSOS = () => {
    if (window.confirm('Kirim sinyal SOS? Tim operasi akan segera merespons.')) {
      driverAPI.sosTrigger({}).then(() => alert('SOS telah dikirim.'));
    }
  };

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Keselamatan</h2>
      </header>

      <div className="drv-page-body">
        <Card style={{ marginBottom: 16, border: '2px solid var(--ds-color-danger)', textAlign: 'center' }}>
          <button
            onClick={handleSOS}
            style={{
              background: 'var(--ds-color-danger)', color: '#fff', border: 'none',
              borderRadius: '50%', width: 72, height: 72, display: 'grid',
              placeItems: 'center', margin: '0 auto 12px', cursor: 'pointer',
              fontSize: 28, fontWeight: 800,
            }}
          >
            SOS
          </button>
          <Heading size="sm" color="danger">Darurat</Heading>
          <Text size="xs" color="muted" style={{ marginTop: 4 }}>Tekan untuk mengirim sinyal darurat</Text>
        </Card>

        <Heading size="xs" style={{ marginBottom: 8 }}>Kontak Darurat</Heading>
        {loading ? <Loading /> : contacts.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada kontak" description="Tambahkan kontak darurat." />
        ) : (
          contacts.map((c) => (
            <Card key={c.id} style={{ marginBottom: 8 }}>
              <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text size="sm" weight="bold">{c.name}</Text>
                  <Text size="xs" color="muted">{c.relation} · {c.phone}</Text>
                </div>
                <Button variant="secondary" size="sm"><Phone size={14} /></Button>
              </Flex>
            </Card>
          ))
        )}

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Card style={{ textAlign: 'center' }}>
            <MapPin size={24} color="var(--ds-color-primary)" style={{ margin: '0 auto 8px' }} />
            <Text size="xs">Bagikan Lokasi</Text>
          </Card>
          <Card style={{ textAlign: 'center' }}>
            <Shield size={24} color="var(--ds-color-primary)" style={{ margin: '0 auto 8px' }} />
            <Text size="xs">Cek Keamanan</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
