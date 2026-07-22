import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Button, Skeleton, ErrorState, EmptyState, Toast } from '../../design-system/index.js';
import { ChevronLeft, CreditCard, Banknote, Wallet, Plus, Trash2, CheckCircle, AlertTriangle, WifiOff, Loader, Landmark, Smartphone } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

export default function PaymentMethods({ onBack }) {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [pm, w] = await Promise.all([
        papi.getPaymentMethods?.() || [],
        papi.getWallet?.() || { balance: 0, currency: 'IDR' },
      ]);
      setPayments(pm);
      setWallet(w);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleDelete = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setToast({ variant: 'success', message: 'Metode pembayaran dihapus' });
  };

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Pembayaran</h1>
        </header>
        <div className="pasv-pro__skeleton">{[0,1,2].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={64} />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Pembayaran</h1>
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
          <h1 className="pasv-pro__title">Pembayaran</h1>
        </header>
        <EmptyState icon={WifiOff} title="Mode offline" />
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Pembayaran</h1>
        <button type="button" className="pasv-pro__icon-btn" aria-label="Tambah pembayaran" onClick={() => setToast({ variant: 'info', message: 'Fitur tambah pembayaran segera hadir' })}><Icon icon={Plus} size="sm" /></button>
      </header>

      <div className="pasv-pro__body">
        {/* Wallet */}
        {wallet && (
          <div className="pasv-pro__card">
            <div className="pasv-pro__stat">
              <span className="pasv-pro__stat-value">Rp {wallet.balance.toLocaleString('id-ID')}</span>
              <span className="pasv-pro__stat-label">Saldo Dompet</span>
              <span className="pasv-pro__stat-desc">Gunakan untuk pembayaran instan</span>
              <Button variant="primary" size="sm" className="pasv-pro__stat-btn">Top Up</Button>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Kartu & Bank</h2></div>
          {payments.length === 0 ? (
            <div className="pasv-pro__empty-sm">Belum ada metode pembayaran</div>
          ) : (
            payments.map((pm) => (
              <div key={pm.id} className={`pasv-pro__pm${pm.isDefault ? ' pasv-pro__pm--default' : ''}`}>
                <span className="pasv-pro__pm-icon"><CreditCard size={18} /></span>
                <div className="pasv-pro__pm-info">
                  <div className="pasv-pro__pm-name">{pm.name}</div>
                  <div className="pasv-pro__pm-detail">{pm.type === 'card' ? `**** ${pm.last4 || '1234'}` : pm.accountNumber || ''}</div>
                </div>
                {pm.isDefault && <span className="pasv-pro__badge-util">Utama</span>}
                <button type="button" className="pasv-pro__addr-act pasv-pro__addr-act--danger" aria-label="Hapus" onClick={() => handleDelete(pm.id)}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
