import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Button, Skeleton, ErrorState, EmptyState, Toast } from '../../design-system/index.js';
import { ChevronLeft, Home, Building, Coffee, Star, Plus, Trash2, Edit3, MapPin, AlertTriangle, WifiOff, Loader, CheckCircle, X } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

const ICONS = { home: Home, building: Building, coffee: Coffee, default: MapPin };

export default function SavedAddresses({ onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const data = await papi.getSavedAddresses();
      setAddresses(data);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleSave = async (data) => {
    try {
      if (editModal?.id) {
        await papi.updateAddress(editModal.id, data);
        setAddresses((prev) => prev.map((a) => a.id === editModal.id ? { ...a, ...data } : a));
      } else {
        const created = await papi.addAddress(data);
        setAddresses((prev) => [...prev, created]);
      }
      setToast({ variant: 'success', message: 'Alamat berhasil disimpan' });
      setEditModal(null);
    } catch { setToast({ variant: 'error', message: 'Gagal menyimpan alamat' }); }
  };

  const handleDelete = async (id) => {
    try {
      await papi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setToast({ variant: 'success', message: 'Alamat dihapus' });
    } catch { setToast({ variant: 'error', message: 'Gagal menghapus' }); }
  };

  const handleSetDefault = async (id) => {
    try {
      await papi.setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      setToast({ variant: 'success', message: 'Alamat utama diperbarui' });
    } catch {}
  };

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Alamat Tersimpan</h1>
        </header>
        <div className="pasv-pro__skeleton">{[0,1,2].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={72} />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Alamat Tersimpan</h1>
        </header>
        <ErrorState icon={AlertTriangle} title="Gagal memuat" description="Periksa koneksi Anda." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />
      </div>
    );
  }

  if (offline) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Alamat Tersimpan</h1>
        </header>
        <EmptyState icon={WifiOff} title="Mode offline" />
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Alamat Tersimpan</h1>
        <button type="button" className="pasv-pro__icon-btn" aria-label="Tambah alamat" onClick={() => setEditModal({})}><Icon icon={Plus} size="sm" /></button>
      </header>

      <div className="pasv-pro__body">
        {addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="Belum ada alamat" description="Tambahkan alamat untuk memudahkan pemesanan." action={<Button variant="primary" onClick={() => setEditModal({})}>Tambah Alamat</Button>} />
        ) : (
          addresses.map((addr) => {
            const IconComp = ICONS[addr.icon] || MapPin;
            return (
              <div key={addr.id} className={`pasv-pro__addr${addr.isDefault ? ' pasv-pro__addr--default' : ''}`}>
                <div className="pasv-pro__addr-icon"><IconComp size={20} /></div>
                <div className="pasv-pro__addr-info">
                  <div className="pasv-pro__addr-label">{addr.label}{addr.isDefault && <span className="pasv-pro__badge-util">Utama</span>}</div>
                  <div className="pasv-pro__addr-text">{addr.address}</div>
                </div>
                <div className="pasv-pro__addr-actions">
                  <button type="button" className="pasv-pro__addr-act" aria-label="Edit" onClick={() => setEditModal(addr)}><Edit3 size={14} /></button>
                  <button type="button" className="pasv-pro__addr-act pasv-pro__addr-act--danger" aria-label="Hapus" onClick={() => handleDelete(addr.id)}><Trash2 size={14} /></button>
                </div>
                {!addr.isDefault && (
                  <button type="button" className="pasv-pro__addr-default" onClick={() => handleSetDefault(addr.id)}>Jadikan utama</button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editModal && <AddressForm addr={editModal} onSave={handleSave} onClose={() => setEditModal(null)} />}
      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

function AddressForm({ addr, onSave, onClose }) {
  const [label, setLabel] = useState(addr?.label || '');
  const [address, setAddress] = useState(addr?.address || '');
  const [icon, setIcon] = useState(addr?.icon || 'home');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim() || !address.trim()) return;
    await onSave({ label: label.trim(), address: address.trim(), icon });
  };

  return (
    <div className="pasv-pro__overlay" onClick={onClose}>
      <div className="pasv-pro__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={addr?.id ? 'Edit alamat' : 'Tambah alamat'}>
        <header className="pasv-pro__modal-header">
          <h2 className="pasv-pro__modal-title">{addr?.id ? 'Edit Alamat' : 'Tambah Alamat'}</h2>
          <button type="button" className="pasv-pro__icon-btn" aria-label="Tutup" onClick={onClose}><Icon icon={X} size="sm" /></button>
        </header>
        <form className="pasv-pro__modal-body" onSubmit={handleSubmit}>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Label</label>
            <input className="pasv-pro__input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Rumah, Kantor, dll" aria-label="Label" required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Alamat</label>
            <input className="pasv-pro__input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Contoh No. 123" aria-label="Alamat" required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Ikon</label>
            <div className="pasv-pro__icon-picker">
              {['home', 'building', 'coffee', 'default'].map((ic) => {
                const Icn = ICONS[ic] || MapPin;
                return (
                  <button key={ic} type="button" className={`pasv-pro__icon-opt${icon === ic ? ' pasv-pro__icon-opt--active' : ''}`} onClick={() => setIcon(ic)}><Icn size={18} /></button>
                );
              })}
            </div>
          </div>
          <div className="pasv-pro__actions">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" type="submit" disabled={!label.trim() || !address.trim()}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
