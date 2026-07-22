import React, { useEffect, useRef, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState,
} from '../../design-system/index.js';
import {
  ShieldCheck, Fingerprint, KeyRound, Clock, Eye, EyeOff, Smartphone,
  CheckCircle2, XCircle, ChevronLeft, AlertTriangle, RefreshCw, WifiOff,
} from 'lucide-react';
import * as papi from '../api.js';
import './wallet.css';

const SECURITY_TIPS = [
  'Jangan bagikan PIN atau OTP kepada siapa pun, termasuk pihak Ojol.',
  'Aktifkan biometrik untuk membuka dompet lebih aman.',
  'Periksa status perangkat secara berkala di perangkat tepercaya.',
  'Keluar dari sesi saat menggunakan perangkat publik.',
];

/**
 * WalletSecurity (4F) — Biometric unlock, PIN verify, session timeout,
 * sensitive-data masking toggle, device verification, security tips.
 * REUSES: api.getSecurityStatus / verifyPin / unlockWithBiometric /
 * updateSessionTimeout (sample, built on the existing Auth module `me()` +
 * token helpers — no backend logic). design-system components.
 */
export default function WalletSecurity({ onBack }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [masked, setMasked] = useState(true);
  const [timeoutMin, setTimeoutMin] = useState(5);

  // Unlock gate (biometric or PIN) before showing sensitive controls.
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [bioDone, setBioDone] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timerRef = useRef(null);

  const load = async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const s = await papi.getSecurityStatus();
      setStatus(s);
      setTimeoutMin(s.sessionTimeoutMin || 5);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [offline]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Session auto-timeout: lock the screen after `timeoutMin` of inactivity.
  const resetTimer = () => {
    clearTimeout(timerRef.current);
    if (!locked) {
      timerRef.current = setTimeout(() => { setLocked(true); setSessionExpired(true); }, timeoutMin * 60 * 1000);
    }
  };
  useEffect(() => {
    resetTimer();
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => { clearTimeout(timerRef.current); events.forEach((e) => window.removeEventListener(e, resetTimer)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, timeoutMin]);

  const doBiometric = async () => {
    setUnlocking(true); setPinErr('');
    try { await papi.unlockWithBiometric(); setBioDone(true); setLocked(false); setSessionExpired(false); }
    catch (e) { setPinErr(e.message || 'Biometrik gagal'); }
    finally { setUnlocking(false); }
  };

  const doPin = async () => {
    setUnlocking(true); setPinErr('');
    try { await papi.verifyPin(pin); setLocked(false); setSessionExpired(false); setPin(''); }
    catch (e) { setPinErr(e.message || 'PIN salah'); }
    finally { setUnlocking(false); }
  };

  const changeTimeout = async (min) => {
    setTimeoutMin(min);
    try { await papi.updateSessionTimeout(min); } catch { /* sample; ignore */ }
  };

  // ---- States ----
  if (loading) {
    return (
      <div className="pasv-sec">
        <Bar onBack={onBack} />
        <div className="pasv-sec__body">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rect" height={64} radius="md" />)}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="pasv-sec">
        <Bar onBack={onBack} />
        <div className="pasv-sec__body"><ErrorState title="Gagal memuat keamanan" description="Terjadi kesalahan." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} /></div>
      </div>
    );
  }
  if (offline) {
    return (
      <div className="pasv-sec">
        <Bar onBack={onBack} />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden /><span className="pasv-conn__msg">Koneksi terputus.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); load(); }}><Icon icon={RefreshCw} size="xs" /> Coba lagi</button>
        </div>
        <div className="pasv-sec__body"><EmptyState icon={WifiOff} title="Mode Offline" description="Pengaturan keamanan akan dimuat saat koneksi kembali." /></div>
      </div>
    );
  }

  // ---- Locked (unlock required) ----
  if (locked) {
    return (
      <div className="pasv-sec">
        <Bar onBack={onBack} />
        <div className="pasv-sec__body pasv-sec__lock">
          <div className="pasv-sec__lock-ico" aria-hidden><ShieldCheck size={48} /></div>
          <h2 className="pasv-sec__lock-title">{sessionExpired ? 'Sesi Berakhir' : 'Kunci Dompet'}</h2>
          <p className="pasv-sec__lock-sub">{sessionExpired ? 'Sesi Anda telah berakhir. Buka untuk melanjutkan.' : 'Verifikasi untuk mengakses pengaturan keamanan.'}</p>
          {status?.biometricSupported && (
            <Button variant="primary" className="pasv-sec__lock-btn" disabled={unlocking} onClick={doBiometric}>
              <Icon icon={Fingerprint} size="sm" /> {unlocking ? 'Memverifikasi…' : 'Buka dengan Biometrik'}
            </Button>
          )}
          <div className="pasv-sec__pin">
            <label className="pasv-sec__pin-lbl" htmlFor="sec-pin">PIN (6 digit)</label>
            <input id="sec-pin" className="pasv-sec__pin-input" inputMode="numeric" maxLength={6} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, ''))} placeholder="••••••" aria-label="Masukkan PIN 6 digit" />
            <Button variant="outline" disabled={unlocking || pin.length !== 6} onClick={doPin}>Buka dengan PIN</Button>
            {pinErr && <p className="pasv-sec__pin-err" role="alert"><Icon icon={AlertTriangle} size="xs" /> {pinErr}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---- Unlocked: security dashboard ----
  return (
    <div className="pasv-sec">
      <Bar onBack={onBack} />
      <div className="pasv-sec__body">
        <section className="pasv-sec__card" aria-label="Status keamanan">
          <h2 className="pasv-sec__sec">Status Keamanan</h2>
          <Row icon={status?.deviceVerified ? CheckCircle2 : XCircle} tone={status?.deviceVerified ? 'ok' : 'bad'}
            label="Verifikasi Perangkat" value={status?.deviceVerified ? 'Terverifikasi' : 'Belum verifikasi'} />
          <Row icon={status?.pinSet ? CheckCircle2 : XCircle} tone={status?.pinSet ? 'ok' : 'bad'}
            label="PIN Dompet" value={status?.pinSet ? 'Aktif' : 'Belum diatur'} />
          <Row icon={Smartphone} tone={status?.biometricSupported ? 'ok' : 'neutral'}
            label="Biometrik" value={status?.biometricSupported ? 'Didukung' : 'Tidak didukung'} />
          <Row icon={Clock} tone="neutral" label="Sesi terakhir" value={status?.lastSession ? new Date(status.lastSession).toLocaleString('id-ID') : '—'} />
        </section>

        <section className="pasv-sec__card" aria-label="Sensitif">
          <h2 className="pasv-sec__sec">Data Sensitif</h2>
          <div className="pasv-sec__mask">
            <span><Eye size={14} /> Sembunyikan saldo & nomor kartu</span>
            <button type="button" className={`pasv-sec__toggle ${masked ? 'is-on' : ''}`} role="switch" aria-checked={masked}
              aria-label="Sembunyikan data sensitif" onClick={() => setMasked((m) => !m)}>
              <span className="pasv-sec__toggle-knob" />
            </button>
          </div>
          <p className="pasv-sec__hint">{masked ? 'Saldo dan nomor kartu akan disamarkan.' : 'Data sensitif ditampilkan.'}</p>
        </section>

        <section className="pasv-sec__card" aria-label="Batas sesi">
          <h2 className="pasv-sec__sec">Batas Waktu Sesi</h2>
          <div className="pasv-sec__timeouts" role="radiogroup" aria-label="Pilih batas waktu sesi">
            {[1, 5, 15, 30].map((m) => (
              <button key={m} type="button" role="radio" aria-checked={timeoutMin === m}
                className={`pasv-sec__timeout ${timeoutMin === m ? 'is-active' : ''}`} onClick={() => changeTimeout(m)}>
                {m} mnt
              </button>
            ))}
          </div>
          <p className="pasv-sec__hint">Dompet terkunci otomatis setelah {timeoutMin} menit tidak aktif.</p>
        </section>

        <section className="pasv-sec__card" aria-label="Tips keamanan">
          <h2 className="pasv-sec__sec">Tips Keamanan</h2>
          <ul className="pasv-sec__tips">
            {SECURITY_TIPS.map((t, i) => (
              <li key={i} className="pasv-sec__tip"><ShieldCheck size={14} /> {t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Row({ icon: Ico, tone, label, value }) {
  const color = tone === 'ok' ? 'var(--ds-color-success)' : tone === 'bad' ? 'var(--ds-color-danger)' : 'var(--ds-color-text-muted)';
  return (
    <div className="pasv-sec__row">
      <span className="pasv-sec__row-ico" style={{ color }}><Icon icon={Ico} size="sm" /></span>
      <span className="pasv-sec__row-label">{label}</span>
      <span className="pasv-sec__row-value">{value}</span>
    </div>
  );
}

function Bar({ onBack }) {
  return (
    <header className="pasv-sec__bar">
      <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
      <h1 className="pasv-sec__title">Keamanan Dompet</h1>
      <span className="pasv-sec__bar-spacer" />
    </header>
  );
}
