import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Button, Skeleton, ErrorState, EmptyState, Toast } from '../../design-system/index.js';
import { ChevronLeft, ChevronRight, Lock, Eye, Smartphone, Clock, Shield, ShieldCheck, LogOut, AlertTriangle, WifiOff, Loader, CheckCircle, X, Fingerprint, Key, History, Trash2 } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

export default function SecurityCenter({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState([]);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [p, lh, td] = await Promise.all([
        papi.getProfile(),
        papi.getLoginHistory(),
        papi.getTrustedDevices(),
      ]);
      setProfile(p); setLoginHistory(lh); setTrustedDevices(td);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Keamanan</h1>
        </header>
        <div className="pasv-pro__skeleton">{[0,1,2,3].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={48} />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Keamanan</h1>
        </header>
        <ErrorState icon={AlertTriangle} title="Gagal memuat" action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />
      </div>
    );
  }

  if (offline) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Keamanan</h1>
        </header>
        <EmptyState icon={WifiOff} title="Mode offline" />
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Keamanan</h1>
      </header>

      <div className="pasv-pro__body">
        {/* Password & PIN */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Kata Sandi & PIN</h2></div>
          <button type="button" className="pasv-pro__row" onClick={() => setActiveModal('password')}>
            <span className="pasv-pro__row-icon pasv-pro__row-icon--warning"><Lock size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Ubah Password</div></span>
            <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
          </button>
          <button type="button" className="pasv-pro__row" onClick={() => setActiveModal('pin')}>
            <span className="pasv-pro__row-icon pasv-pro__row-icon--purple"><Key size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Ubah PIN Keamanan</div></span>
            <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
          </button>
        </div>

        {/* Biometric */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Biometrik</h2></div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--success"><Fingerprint size={18} /></span>
            <span className="pasv-pro__row-body">
              <div className="pasv-pro__row-label">Sidik Jari / Face ID</div>
              <div className="pasv-pro__row-hint">Gunakan biometrik untuk login cepat</div>
            </span>
            <label className="pasv-pro__switch" aria-label="Biometrik">
              <input type="checkbox" defaultChecked />
              <span className="pasv-pro__switch-slider" />
            </label>
          </div>
        </div>

        {/* 2FA */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Autentikasi Dua Faktor</h2></div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--primary"><ShieldCheck size={18} /></span>
            <span className="pasv-pro__row-body">
              <div className="pasv-pro__row-label">2FA via SMS</div>
              <div className="pasv-pro__row-hint">Kode verifikasi tambahan saat login</div>
            </span>
            <label className="pasv-pro__switch" aria-label="2FA">
              <input type="checkbox" />
              <span className="pasv-pro__switch-slider" />
            </label>
          </div>
        </div>

        {/* Trusted Devices */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Perangkat Dipercaya</h2></div>
          {trustedDevices.map((d) => (
            <div key={d.id} className="pasv-pro__row">
              <span className="pasv-pro__row-icon pasv-pro__row-icon--info"><Smartphone size={18} /></span>
              <span className="pasv-pro__row-body">
                <div className="pasv-pro__row-label">{d.name}{d.current && <span className="pasv-pro__badge-util pasv-pro__badge-util--sm">Perangkat ini</span>}</div>
                <div className="pasv-pro__row-hint">{d.os} · Terakhir: {new Date(d.lastUsed).toLocaleDateString('id-ID')}</div>
              </span>
              {!d.current && (
                <button type="button" className="pasv-pro__addr-act pasv-pro__addr-act--danger" aria-label="Hapus perangkat" onClick={async () => {
                  await papi.removeTrustedDevice(d.id);
                  setTrustedDevices((prev) => prev.filter((x) => x.id !== d.id));
                  setToast({ variant: 'success', message: 'Perangkat dihapus' });
                }}><Trash2 size={14} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Login History */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Riwayat Login</h2></div>
          {loginHistory.map((lh) => (
            <div key={lh.id} className="pasv-pro__row">
              <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><History size={18} /></span>
              <span className="pasv-pro__row-body">
                <div className="pasv-pro__row-label">{lh.device}{lh.current && <span className="pasv-pro__badge-util pasv-pro__badge-util--sm">Saat ini</span>}</div>
                <div className="pasv-pro__row-hint">{lh.location} · {lh.ip} · {new Date(lh.time).toLocaleString('id-ID')}</div>
              </span>
            </div>
          ))}
        </div>

        {/* Active Sessions */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Sesi Aktif</h2></div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--warning"><Smartphone size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Perangkat ini</div></span>
            <span className="pasv-pro__row-value pasv-pro__row-value--active">Aktif</span>
          </div>
          <Button variant="secondary" fullWidth className="pasv-pro__sec-act" onClick={async () => {
            await papi.logoutAllDevices();
            setToast({ variant: 'success', message: 'Perangkat lain telah logout' });
          }}>
            <LogOut size={14} /> Logout Perangkat Lain
          </Button>
        </div>

        {/* Security Tips */}
        <div className="pasv-pro__tips">
          <ShieldCheck size={16} />
          <div className="pasv-pro__tips-body">
            <strong>Tips Keamanan</strong>
            <p>Gunakan password yang kuat dan unik. Aktifkan autentikasi dua faktor untuk perlindungan ekstra. Jangan bagikan kode OTP kepada siapa pun.</p>
          </div>
        </div>
      </div>

      {activeModal === 'password' && <PasswordForm onClose={() => setActiveModal(null)} onToast={setToast} />}
      {activeModal === 'pin' && <PinForm onClose={() => setActiveModal(null)} onToast={setToast} />}
      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

function PasswordForm({ onClose, onToast }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) { onToast({ variant: 'error', message: 'Password baru tidak cocok' }); return; }
    setSaving(true);
    try { await papi.updatePassword(current, newPass); onToast({ variant: 'success', message: 'Password berhasil diubah' }); onClose(); }
    catch (err) { onToast({ variant: 'error', message: err.message || 'Gagal ubah password' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="pasv-pro__overlay" onClick={onClose}>
      <div className="pasv-pro__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Ubah password">
        <header className="pasv-pro__modal-header">
          <h2 className="pasv-pro__modal-title">Ubah Password</h2>
          <button type="button" className="pasv-pro__icon-btn" aria-label="Tutup" onClick={onClose}><Icon icon={X} size="sm" /></button>
        </header>
        <form className="pasv-pro__modal-body" onSubmit={handleSubmit}>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Password Saat Ini</label>
            <input className="pasv-pro__input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Password Baru</label>
            <input className="pasv-pro__input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} minLength={8} required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Konfirmasi Password Baru</label>
            <input className="pasv-pro__input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
          </div>
          <div className="pasv-pro__actions">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" type="submit" disabled={saving || !current || !newPass || !confirm}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PinForm({ onClose, onToast }) {
  const [current, setCurrent] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPin !== confirm) { onToast({ variant: 'error', message: 'PIN baru tidak cocok' }); return; }
    if (newPin.length < 6) { onToast({ variant: 'error', message: 'PIN minimal 6 digit' }); return; }
    setSaving(true);
    try { await papi.updatePin(current, newPin); onToast({ variant: 'success', message: 'PIN berhasil diubah' }); onClose(); }
    catch (err) { onToast({ variant: 'error', message: err.message || 'Gagal ubah PIN' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="pasv-pro__overlay" onClick={onClose}>
      <div className="pasv-pro__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Ubah PIN">
        <header className="pasv-pro__modal-header">
          <h2 className="pasv-pro__modal-title">Ubah PIN Keamanan</h2>
          <button type="button" className="pasv-pro__icon-btn" aria-label="Tutup" onClick={onClose}><Icon icon={X} size="sm" /></button>
        </header>
        <form className="pasv-pro__modal-body" onSubmit={handleSubmit}>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">PIN Saat Ini</label>
            <input className="pasv-pro__input" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">PIN Baru</label>
            <input className="pasv-pro__input" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" value={newPin} onChange={(e) => setNewPin(e.target.value)} required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Konfirmasi PIN Baru</label>
            <input className="pasv-pro__input" type="password" maxLength={6} inputMode="numeric" pattern="[0-9]*" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <div className="pasv-pro__actions">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" type="submit" disabled={saving || !current || !newPin || !confirm}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
