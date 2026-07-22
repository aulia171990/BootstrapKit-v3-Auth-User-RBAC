import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Badge, Skeleton, ErrorState, Button, Modal, Flex, StatusIndicator, EmptyState,
} from '../design-system/index.js';
import { Radio, RefreshCw, Plus, User, MapPin, XCircle, RotateCcw } from 'lucide-react';
import { occApi } from './occ-api.js';

const JOB_STATUS_MAP = {
  pending: { label: 'Menunggu', tone: 'warning' },
  assigned: { label: 'Ditugaskan', tone: 'info' },
  accepted: { label: 'Diterima', tone: 'success' },
  arrived: { label: 'Sampai', tone: 'success' },
  in_progress: { label: 'Berjalan', tone: 'info' },
  completed: { label: 'Selesai', tone: 'neutral' },
  cancelled: { label: 'Batal', tone: 'danger' },
};

export default function DispatchPanel({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showReassign, setShowReassign] = useState(null);
  const [form, setForm] = useState({ booking_id: '', driver_id: '', notes: '' });
  const [reassignForm, setReassignForm] = useState({ driver_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await occApi.dispatchJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setJobs([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleManualDispatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await occApi.manualDispatch(form);
      setShowManual(false);
      setForm({ booking_id: '', driver_id: '', notes: '' });
      load();
    } catch (err) {
      alert('Gagal dispatch: ' + err.message);
    } finally { setSubmitting(false); }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await occApi.reassignDriver({ job_id: showReassign, ...reassignForm });
      setShowReassign(null);
      setReassignForm({ driver_id: '' });
      load();
    } catch (err) {
      alert('Gagal reassign: ' + err.message);
    } finally { setSubmitting(false); }
  };

  const handleCancel = async (jobId) => {
    if (!window.confirm('Yakin ingin membatalkan dispatch ini?')) return;
    try {
      await occApi.cancelDispatch(jobId);
      load();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  };

  const handleRetry = async (jobId) => {
    try {
      await occApi.retryDispatch(jobId);
      load();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="occ-section">
        <div className="occ-section__header">
          <h2 className="occ-section__title">Dispatch Panel</h2>
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-lg)', padding: 16, marginBottom: 8 }}>
              <Skeleton variant="rect" height={16} width="35%" radius="sm" />
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
        title="Gagal memuat dispatch"
        description="Tidak dapat terhubung ke server."
        onRetry={load}
      />
    );
  }

  return (
    <div className="occ-section">
      <div className="occ-section__header">
        <h2 className="occ-section__title">
          <Radio size={16} style={{ marginRight: 6 }} />
          Dispatch Management
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="occ-section__action" onClick={load}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
          <button type="button" className="occ-section__action occ-section__action--primary" onClick={() => setShowManual(true)}>
            <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Manual Dispatch
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Radio}
            title="Tidak ada job dispatch"
            description="Semua permintaan sudah ter-assign atau belum ada pesanan baru."
          />
        </Card>
      ) : (
        <div className="occ-dispatch-list">
          {jobs.map((job) => {
            const st = JOB_STATUS_MAP[job.status] || JOB_STATUS_MAP.pending;
            return (
              <div key={job.id} className="occ-dispatch-card">
                <div className="occ-dispatch-card__header">
                  <div className="occ-dispatch-card__id">Job #{job.id}</div>
                  <Badge variant={st.tone} size="sm">{st.label}</Badge>
                </div>
                <div className="occ-dispatch-card__body">
                  {job.booking_id && (
                    <div className="occ-dispatch-card__row">
                      <MapPin size={14} />
                      <span>Booking: {job.booking_id}</span>
                    </div>
                  )}
                  {job.driver_name && (
                    <div className="occ-dispatch-card__row">
                      <User size={14} />
                      <span>Driver: {job.driver_name}</span>
                    </div>
                  )}
                  {job.notes && (
                    <div className="occ-dispatch-card__notes">{job.notes}</div>
                  )}
                  <div className="occ-dispatch-card__row">
                    <StatusIndicator tone={st.tone} pulse={['pending', 'assigned'].includes(job.status)} />
                    <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                      {job.created_at ? new Date(job.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
                {job.status === 'pending' && (
                  <div className="occ-dispatch-card__actions">
                    <Button size="sm" variant="secondary" onClick={() => setShowReassign(job.id)}>
                      <User size={12} style={{ marginRight: 4 }} />
                      Assign
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleCancel(job.id)}>
                      <XCircle size={12} style={{ marginRight: 4 }} />
                      Batal
                    </Button>
                  </div>
                )}
                {job.status === 'assigned' && (
                  <div className="occ-dispatch-card__actions">
                    <Button size="sm" variant="danger" onClick={() => handleCancel(job.id)}>
                      <XCircle size={12} style={{ marginRight: 4 }} />
                      Batal
                    </Button>
                  </div>
                )}
                {job.status === 'cancelled' && (
                  <div className="occ-dispatch-card__actions">
                    <Button size="sm" variant="secondary" onClick={() => handleRetry(job.id)}>
                      <RotateCcw size={12} style={{ marginRight: 4 }} />
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showManual && (
        <Modal open={showManual} onClose={() => setShowManual(false)} title="Manual Dispatch">
          <form onSubmit={handleManualDispatch}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="occ-field">
                <label className="occ-label">Booking ID</label>
                <input className="occ-input" value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })} required />
              </div>
              <div className="occ-field">
                <label className="occ-label">Driver ID</label>
                <input className="occ-input" value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} required />
              </div>
              <div className="occ-field">
                <label className="occ-label">Catatan</label>
                <textarea className="occ-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Flex gap={8} justify="end">
                <Button variant="secondary" onClick={() => setShowManual(false)} disabled={submitting}>Batal</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Memproses...' : 'Dispatch'}</Button>
              </Flex>
            </div>
          </form>
        </Modal>
      )}

      {showReassign && (
        <Modal open={!!showReassign} onClose={() => setShowReassign(null)} title="Assign / Reassign Driver">
          <form onSubmit={handleReassign}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="occ-field">
                <label className="occ-label">Driver ID Baru</label>
                <input className="occ-input" value={reassignForm.driver_id} onChange={(e) => setReassignForm({ driver_id: e.target.value })} required />
              </div>
              <Flex gap={8} justify="end">
                <Button variant="secondary" onClick={() => setShowReassign(null)} disabled={submitting}>Batal</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Memproses...' : 'Assign'}</Button>
              </Flex>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
