import React, { useState, useEffect, useCallback } from 'react';
import { Switch, Select, Button, Icon, Skeleton } from '../../design-system/index.js';
import { ChevronLeft, Bell } from 'lucide-react';
import * as papi from '../api.js';
import './notificationPreferences.css';

const CATEGORY_LABELS = {
  booking: 'Pesanan',
  trip: 'Perjalanan',
  payment: 'Pembayaran',
  wallet: 'Dompet',
  promotion: 'Promo',
  chat: 'Chat',
  security: 'Keamanan',
  system: 'Sistem',
};

const LANGUAGE_OPTIONS = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
];

export default function NotificationPreferences({ onBack }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastError, setToastError] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError(false);
    papi.getNotificationPreferences()
      .then((data) => { setPrefs({ ...data }); setLoading(false); })
      .catch(() => { setPrefs({ ...papi.DEFAULT_PREFS }); setError(false); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => {
    setPrefs((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const setCat = (key, value) => {
    setPrefs((prev) => prev ? { ...prev, categories: { ...prev.categories, [key]: value } } : prev);
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await papi.updateNotificationPreferences(prefs);
      setToastError(false);
      setToast('Pengaturan berhasil disimpan');
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToastError(true);
      setToast('Gagal menyimpan pengaturan');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pasv-np">
        <header className="pasv-np__bar">
          <span style={{ width: 36, height: 36 }} />
          <h1 className="pasv-np__title">Pengaturan Notifikasi</h1>
        </header>
        <div className="pasv-np__body">
          {[0, 1, 2].map((i) => (
            <div className="pasv-np__card" key={i}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pasv-np">
      <header className="pasv-np__bar">
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}>
          <Icon icon={ChevronLeft} size="sm" />
        </button>
        <h1 className="pasv-np__title">Pengaturan Notifikasi</h1>
        <span className="pasv-np__bar-spacer" />
      </header>

      <div className="pasv-np__body">
        <section className="pasv-np__card" aria-label="Saluran notifikasi">
          <h2 className="pasv-np__sec">Saluran Notifikasi</h2>
          <div className="pasv-np__row">
            <span className="pasv-np__row-label">Push Notification</span>
            <Switch checked={prefs.push_enabled} onChange={(e) => set('push_enabled', e.target.checked)} />
          </div>
          <div className="pasv-np__row">
            <span className="pasv-np__row-label">Email</span>
            <Switch checked={prefs.email_enabled} onChange={(e) => set('email_enabled', e.target.checked)} />
          </div>
          <div className="pasv-np__row">
            <span className="pasv-np__row-label">SMS</span>
            <Switch checked={prefs.sms_enabled} onChange={(e) => set('sms_enabled', e.target.checked)} />
          </div>
        </section>

        <section className="pasv-np__card" aria-label="Kategori notifikasi">
          <h2 className="pasv-np__sec">Kategori Notifikasi</h2>
          <p className="pasv-np__row-hint">Pilih jenis notifikasi yang ingin Anda terima.</p>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div className="pasv-np__row" key={key}>
              <span className="pasv-np__row-label">{label}</span>
              <Switch checked={prefs.categories[key]} onChange={(e) => setCat(key, e.target.checked)} />
            </div>
          ))}
        </section>

        <section className="pasv-np__card" aria-label="Jam tenang">
          <h2 className="pasv-np__sec">Jam Tenang (Quiet Hours)</h2>
          <p className="pasv-np__row-hint">Nonaktifkan notifikasi push selama jam tertentu.</p>
          <div className="pasv-np__time-group">
            <div className="pasv-np__time-field">
              <label className="ds-field__label" htmlFor="np-qh-start">Mulai</label>
              <input id="np-qh-start" type="time" className="ds-control" value={prefs.quiet_hours_start} onChange={(e) => set('quiet_hours_start', e.target.value)} />
            </div>
            <div className="pasv-np__time-field">
              <label className="ds-field__label" htmlFor="np-qh-end">Selesai</label>
              <input id="np-qh-end" type="time" className="ds-control" value={prefs.quiet_hours_end} onChange={(e) => set('quiet_hours_end', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="pasv-np__card" aria-label="Bahasa">
          <h2 className="pasv-np__sec">Bahasa</h2>
          <Select options={LANGUAGE_OPTIONS} value={prefs.language} onChange={(e) => set('language', e.target.value)} placeholder="Pilih bahasa" />
        </section>
      </div>

      <div className="pasv-np__save">
        <Button fullWidth loading={saving} onClick={handleSave}>Simpan Pengaturan</Button>
      </div>

      {toast && (
        <div className="pasv-np__toast" style={toastError ? { background: 'var(--ds-color-danger, #dc2626)' } : undefined} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
