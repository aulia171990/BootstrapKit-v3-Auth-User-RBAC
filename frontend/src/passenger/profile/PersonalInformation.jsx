import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge, Icon, Button, Skeleton, ErrorState, EmptyState, Toast } from '../../design-system/index.js';
import { User, ChevronLeft, ChevronRight, Camera, CheckCircle, AlertTriangle, FileImage, MapPin, Calendar, WifiOff, Loader, Save, X } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

export default function PersonalInformation({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', gender: '' });

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const p = await papi.getProfile(user);
      setProfile(p);
      setForm({ name: p.name, phone: p.phone, email: p.email, birthDate: p.birthDate, gender: p.gender });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [user, offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await papi.updateProfile(form);
      setProfile((prev) => ({ ...prev, ...form }));
      setEditing(false);
      setToast({ variant: 'success', message: 'Profil berhasil diperbarui' });
    } catch { setToast({ variant: 'error', message: 'Gagal menyimpan profil' }); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Data Diri</h1>
        </header>
        <div className="pasv-pro__skeleton">
          <div className="pasv-pro__skeleton-row" style={{ justifyContent: 'center' }}><Skeleton variant="circle" width={80} height={80} /></div>
          {[0,1,2,3,4].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={48} />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Data Diri</h1>
        </header>
        <ErrorState icon={AlertTriangle} title="Gagal memuat data" description="Periksa koneksi Anda." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />
      </div>
    );
  }

  if (offline) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Data Diri</h1>
        </header>
        <EmptyState icon={WifiOff} title="Mode offline" description="Data tidak tersedia saat offline." />
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Data Diri</h1>
        <span className="pasv-pro__bar-spacer" />
        {!editing && (
          <button type="button" className="pasv-pro__icon-btn" aria-label="Edit" onClick={() => setEditing(true)}><Icon icon={User} size="sm" /></button>
        )}
      </header>

      <div className="pasv-pro__body">
        {/* Avatar */}
        <div className="pasv-pro__avatar-section">
          <div className="pasv-pro__avatar-wrap">
            {profile.avatar ? <img src={profile.avatar} alt="" className="pasv-pro__avatar-img" /> : <User size={32} />}
            {editing && (
              <button type="button" className="pasv-pro__avatar-cam" aria-label="Ubah foto profil">
                <Camera size={14} />
              </button>
            )}
          </div>
          {!editing && profile.verified && (
            <Badge variant="success" size="sm"><CheckCircle size={10} /> Terverifikasi</Badge>
          )}
          <div className="pasv-pro__avatar-name">{profile.name}</div>
          <div className="pasv-pro__avatar-sub">Anggota sejak {new Date(profile.memberSince).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</div>
        </div>

        {/* Fields */}
        <div className="pasv-pro__section">
          {editing && (
            <>
              <div className="pasv-pro__field">
                <label className="pasv-pro__label">Nama Lengkap</label>
                <input className="pasv-pro__input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" aria-label="Nama Lengkap" />
              </div>
              <div className="pasv-pro__field">
                <label className="pasv-pro__label">Nomor Telepon</label>
                <input className="pasv-pro__input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+628xxxxxxxxxx" aria-label="Nomor Telepon" type="tel" />
              </div>
              <div className="pasv-pro__field">
                <label className="pasv-pro__label">Email</label>
                <input className="pasv-pro__input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" aria-label="Email" type="email" />
              </div>
              <div className="pasv-pro__field">
                <label className="pasv-pro__label">Tanggal Lahir</label>
                <input className="pasv-pro__input" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} type="date" aria-label="Tanggal Lahir" />
              </div>
              <div className="pasv-pro__field">
                <label className="pasv-pro__label">Jenis Kelamin</label>
                <select className="pasv-pro__input pasv-pro__select" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} aria-label="Jenis Kelamin">
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div className="pasv-pro__actions">
                <Button variant="secondary" onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone, email: profile.email, birthDate: profile.birthDate, gender: profile.gender }); }} disabled={saving}>
                  Batal
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </>
          )}
          {!editing && (
            <>
              <div className="pasv-pro__row">
                <span className="pasv-pro__row-icon pasv-pro__row-icon--primary"><User size={18} /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">Nama Lengkap</div>
                  <div className="pasv-pro__row-hint">{profile.name}</div>
                </span>
              </div>
              <div className="pasv-pro__row">
                <span className="pasv-pro__row-icon pasv-pro__row-icon--success"><MapPin size={18} /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">Nomor Telepon</div>
                  <div className="pasv-pro__row-hint">{profile.phone}</div>
                </span>
              </div>
              <div className="pasv-pro__row">
                <span className="pasv-pro__row-icon pasv-pro__row-icon--info"><Mail size={18} /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">Email</div>
                  <div className="pasv-pro__row-hint">{profile.email}</div>
                </span>
              </div>
              <div className="pasv-pro__row">
                <span className="pasv-pro__row-icon pasv-pro__row-icon--purple"><Calendar size={18} /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">Tanggal Lahir</div>
                  <div className="pasv-pro__row-hint">{new Date(profile.birthDate + 'T00:00:00').toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </span>
              </div>
              <div className="pasv-pro__row">
                <span className="pasv-pro__row-icon pasv-pro__row-icon--pink"><User size={18} /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">Jenis Kelamin</div>
                  <div className="pasv-pro__row-hint">{profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
