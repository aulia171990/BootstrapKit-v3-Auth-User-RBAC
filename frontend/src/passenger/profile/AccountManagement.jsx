import React, { useState } from 'react';
import { Icon, Button, Toast } from '../../design-system/index.js';
import { ChevronLeft, LogOut, ShieldAlert, Trash2, FileText, Info, Smartphone, AlertTriangle, X, ChevronRight } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

const SECTIONS = [
  {
    key: 'account',
    title: 'Akun',
    items: [
      { id: 'logoutAll', label: 'Logout Semua Perangkat', hint: 'Keluar dari semua sesi aktif', icon: LogOut, color: '#d97706' },
      { id: 'deactivate', label: 'Nonaktifkan Akun', hint: 'Nonaktifkan sementara', icon: ShieldAlert, color: '#dc2626' },
      { id: 'delete', label: 'Hapus Akun', hint: 'Penghapusan permanen', icon: Trash2, color: '#dc2626' },
    ],
  },
  {
    key: 'legal',
    title: 'Legal',
    items: [
      { id: 'privacy', label: 'Kebijakan Privasi', icon: FileText, color: '#6b7280' },
      { id: 'terms', label: 'Ketentuan Layanan', icon: FileText, color: '#6b7280' },
    ],
  },
  {
    key: 'info',
    title: 'Informasi',
    items: [
      { id: 'about', label: 'Tentang Aplikasi', hint: 'Versi 3.2.1 (Build 42)', icon: Info, color: '#6b7280' },
      { id: 'licenses', label: 'Lisensi Open Source', icon: FileText, color: '#6b7280' },
    ],
  },
];

export default function AccountManagement({ onBack, onLogout }) {
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action) => {
    setProcessing(true);
    try {
      switch (action.id) {
        case 'logoutAll':
          await papi.logoutAllDevices();
          setToast({ variant: 'success', message: 'Semua perangkat telah logout' });
          break;
        case 'deactivate':
          await papi.deactivateAccount(password);
          setToast({ variant: 'success', message: 'Akun dinonaktifkan. Anda akan dialihkan...' });
          break;
        case 'delete':
          await papi.deleteAccountRequest();
          setToast({ variant: 'success', message: 'Permintaan penghapusan dikirim. Cek email Anda.' });
          break;
      }
      setConfirmAction(null);
      setPassword('');
    } catch (err) {
      setToast({ variant: 'error', message: err.message || 'Gagal memproses' });
    }
    finally { setProcessing(false); }
  };

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Kelola Akun</h1>
      </header>

      <div className="pasv-pro__body">
        {SECTIONS.map((section) => (
          <div key={section.key} className="pasv-pro__card">
            <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">{section.title}</h2></div>
            {section.items.map((item) => (
              <button key={item.id} type="button" className="pasv-pro__row" onClick={() => {
                if (['deactivate', 'delete'].includes(item.id)) { setConfirmAction(item); }
                else if (item.id === 'logoutAll') { handleAction(item); }
                else { setToast({ variant: 'info', message: `Halaman ${item.label} segera hadir` }); }
              }}>
                <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral" style={{ background: item.color }}><Icon icon={item.icon} size="sm" /></span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">{item.label}</div>
                  {item.hint && <div className="pasv-pro__row-hint">{item.hint}</div>}
                </span>
                <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
              </button>
            ))}
          </div>
        ))}

        <div className="pasv-pro__card">
          <Button variant="danger" fullWidth onClick={() => setConfirmAction({ id: 'logoutAllConfirm', label: 'Logout Semua Perangkat' })}>
            <LogOut size={14} /> Logout Semua Perangkat
          </Button>
        </div>

        <div className="pasv-pro__version">Versi 3.2.1 (Build 42)</div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="pasv-pro__overlay" onClick={() => { setConfirmAction(null); setPassword(''); }}>
          <div className="pasv-pro__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Konfirmasi">
            <header className="pasv-pro__modal-header">
              <h2 className="pasv-pro__modal-title">Konfirmasi</h2>
              <button type="button" className="pasv-pro__icon-btn" aria-label="Tutup" onClick={() => { setConfirmAction(null); setPassword(''); }}><Icon icon={X} size="sm" /></button>
            </header>
            <div className="pasv-pro__modal-body">
              {confirmAction.id === 'logoutAllConfirm' ? (
                <>
                  <div className="pasv-pro__modal-icon"><AlertTriangle size={32} color="#d97706" /></div>
                  <p className="pasv-pro__modal-desc">Anda akan logout dari semua perangkat. Perangkat ini tetap aktif. Lanjutkan?</p>
                  <div className="pasv-pro__actions">
                    <Button variant="secondary" onClick={() => { setConfirmAction(null); }}>Batal</Button>
                    <Button variant="warning" onClick={async () => {
                      await papi.logoutAllDevices();
                      setToast({ variant: 'success', message: 'Semua perangkat telah logout' });
                      setConfirmAction(null);
                    }} disabled={processing}>{processing ? 'Memproses...' : 'Logout Semua'}</Button>
                  </div>
                </>
              ) : confirmAction.id === 'deactivate' ? (
                <>
                  <div className="pasv-pro__modal-icon"><ShieldAlert size={32} color="#dc2626" /></div>
                  <p className="pasv-pro__modal-desc">Nonaktifkan akun Anda? Akun dapat diaktifkan kembali kapan saja.</p>
                  <div className="pasv-pro__field">
                    <label className="pasv-pro__label">Masukkan Password</label>
                    <input className="pasv-pro__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="pasv-pro__actions">
                    <Button variant="secondary" onClick={() => { setConfirmAction(null); setPassword(''); }}>Batal</Button>
                    <Button variant="danger" onClick={() => handleAction(confirmAction)} disabled={processing || !password}>{processing ? 'Memproses...' : 'Nonaktifkan'}</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pasv-pro__modal-icon"><Trash2 size={32} color="#dc2626" /></div>
                  <p className="pasv-pro__modal-desc">Hapus akun secara permanen? Semua data akan dihapus dan tidak dapat dikembalikan.</p>
                  <div className="pasv-pro__field">
                    <label className="pasv-pro__label">Masukkan Password</label>
                    <input className="pasv-pro__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="pasv-pro__actions">
                    <Button variant="secondary" onClick={() => { setConfirmAction(null); setPassword(''); }}>Batal</Button>
                    <Button variant="danger" onClick={() => handleAction(confirmAction)} disabled={processing || !password}>{processing ? 'Memproses...' : 'Hapus Akun'}</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
