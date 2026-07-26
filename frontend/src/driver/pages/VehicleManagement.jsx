import React, { useState } from 'react';
import { Card, Text, Heading, Flex, Button, Input } from '../../design-system/index.js';
import { ChevronLeft, Truck, Edit2, Save, X } from 'lucide-react';

export default function VehicleManagement({ vehicle: initial, onBack, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    plate: initial?.plate || '',
    type: initial?.type || '',
    model: initial?.model || '',
    color: initial?.color || '',
    year: initial?.year || '',
    brand: initial?.brand || '',
  });

  const handleSave = () => {
    onSave?.(form);
    setEditing(false);
  };

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Kendaraan</h2>
        <div style={{ width: 40 }}>
          {!editing ? (
            <button className="drv-icon-btn" onClick={() => setEditing(true)}><Edit2 size={18} /></button>
          ) : (
            <button className="drv-icon-btn" onClick={() => setEditing(false)}><X size={18} /></button>
          )}
        </div>
      </header>

      <div className="drv-page-body">
        <Card style={{ marginBottom: 16, textAlign: 'center' }}>
          <Truck size={48} color="var(--ds-color-primary)" style={{ margin: '0 auto 12px' }} />
          <Heading size="sm">{form.brand || form.model || 'Kendaraan'}</Heading>
          <Text size="xs" color="muted">{form.plate || '—'}</Text>
        </Card>

        <div className="drv-form-group">
          <label className="drv-label">Plat Nomor</label>
          {editing ? (
            <input className="drv-input" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="B 1234 ABC" />
          ) : (
            <Text size="sm" weight="bold">{form.plate || '—'}</Text>
          )}
        </div>

        <div className="drv-form-group">
          <label className="drv-label">Merek</label>
          {editing ? (
            <input className="drv-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Honda" />
          ) : (
            <Text size="sm" weight="bold">{form.brand || '—'}</Text>
          )}
        </div>

        <div className="drv-form-group">
          <label className="drv-label">Model</label>
          {editing ? (
            <input className="drv-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Vario 125" />
          ) : (
            <Text size="sm" weight="bold">{form.model || '—'}</Text>
          )}
        </div>

        <div className="drv-form-group">
          <label className="drv-label">Tipe</label>
          {editing ? (
            <select className="drv-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="">Pilih tipe</option>
              <option value="motor">Motor</option>
              <option value="mobil">Mobil</option>
            </select>
          ) : (
            <Text size="sm" weight="bold">{form.type || '—'}</Text>
          )}
        </div>

        <div className="drv-form-group">
          <label className="drv-label">Warna</label>
          {editing ? (
            <input className="drv-input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Hitam" />
          ) : (
            <Text size="sm" weight="bold">{form.color || '—'}</Text>
          )}
        </div>

        <div className="drv-form-group">
          <label className="drv-label">Tahun</label>
          {editing ? (
            <input className="drv-input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2020" />
          ) : (
            <Text size="sm" weight="bold">{form.year || '—'}</Text>
          )}
        </div>

        {editing && (
          <Button variant="primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSave}>
            <Save size={16} style={{ marginRight: 6 }} /> Simpan
          </Button>
        )}
      </div>
    </div>
  );
}
