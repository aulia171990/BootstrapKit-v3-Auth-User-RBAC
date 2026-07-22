import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Button, Modal,
  Text, Flex, EmptyState,
} from '../design-system/index.js';
import { AlertTriangle, Plus, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { occApi } from './occ-api.js';

const STATUS_MAP = {
  open: { label: 'Terbuka', tone: 'danger' },
  investigating: { label: 'Investigasi', tone: 'warning' },
  resolved: { label: 'Selesai', tone: 'success' },
  closed: { label: 'Tutup', tone: 'neutral' },
};

export default function Incidents({ onNavigate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'low' });

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await occApi.incidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setIncidents([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await occApi.storeIncident(form);
      setShowCreate(false);
      setForm({ title: '', description: '', severity: 'low' });
      load();
    } catch (err) {
      alert('Gagal membuat insiden: ' + err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await occApi.updateIncident(id, { status: 'resolved' });
      load();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title">Insiden</h2>
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16, marginBottom: 8 }}>
              <Skeleton variant="rect" height={16} width="40%" radius="sm" />
              <Skeleton variant="rect" height={12} width="70%" radius="sm" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat insiden"
        description="Tidak dapat terhubung ke server."
        onRetry={load}
      />
    );
  }

  return (
    <div className="occ-section">
      <div className="occ-section__header">
        <h2 className="occ-section__title">Manajemen Insiden</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="occ-section__action" onClick={load}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
          <button type="button" className="occ-section__action occ-section__action--primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Insiden Baru
          </button>
        </div>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Tidak ada insiden"
            description="Semua berjalan lancar. Tidak ada insiden yang dilaporkan."
          />
        </Card>
      ) : (
        <div className="occ-incident-list">
          {incidents.map((inc) => {
            const st = STATUS_MAP[inc.status] || STATUS_MAP.open;
            return (
              <div key={inc.id} className="occ-incident-card">
                <div className="occ-incident-card__header">
                  <div className="occ-incident-card__title">
                    <AlertTriangle size={16} style={{ color: 'var(--ds-color-danger)', flexShrink: 0 }} />
                    <span>{inc.title || 'Untitled'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Badge variant={st.tone} size="sm">{st.label}</Badge>
                    {inc.status === 'open' && (
                      <button
                        className="occ-incident-card__resolve"
                        onClick={() => handleResolve(inc.id)}
                        title="Tandai selesai"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {inc.description && (
                  <div className="occ-incident-card__desc">{inc.description}</div>
                )}
                <div className="occ-incident-card__meta">
                  <span>{inc.severity ? `Severity: ${inc.severity}` : ''}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {inc.created_at ? new Date(inc.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Insiden Baru">
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="occ-field">
                <label className="occ-label">Judul</label>
                <input
                  className="occ-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="occ-field">
                <label className="occ-label">Deskripsi</label>
                <textarea
                  className="occ-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="occ-field">
                <label className="occ-label">Severity</label>
                <select
                  className="occ-input"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <Flex gap={8} justify="end">
                <Button variant="secondary" onClick={() => setShowCreate(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </Flex>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
