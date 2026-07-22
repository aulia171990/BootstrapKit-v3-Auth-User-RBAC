import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Icon, Button, Skeleton, ErrorState, EmptyState, Toast } from '../../design-system/index.js';
import { ChevronLeft, User, Phone, Plus, Trash2, Edit3, AlertTriangle, WifiOff, Loader, CheckCircle, X } from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

export default function EmergencyContacts({ onBack }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const data = await papi.getEmergencyContacts?.() || [];
      setContacts(data);
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
        setContacts((prev) => prev.map((c) => c.id === editModal.id ? { ...c, ...data } : c));
      } else {
        const created = { id: `ec${Date.now()}`, ...data };
        setContacts((prev) => [...prev, created]);
      }
      setToast({ variant: 'success', message: 'Kontak darurat disimpan' });
      setEditModal(null);
    } catch { setToast({ variant: 'error', message: 'Gagal menyimpan' }); }
  };

  const handleDelete = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setToast({ variant: 'success', message: 'Kontak dihapus' });
  };

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Kontak Darurat</h1>
        </header>
        <div className="pasv-pro__skeleton">{[0,1].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={64} />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar">
          <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
          <h1 className="pasv-pro__title">Kontak Darurat</h1>
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
          <h1 className="pasv-pro__title">Kontak Darurat</h1>
        </header>
        <EmptyState icon={WifiOff} title="Mode offline" />
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Kontak Darurat</h1>
        <button type="button" className="pasv-pro__icon-btn" aria-label="Tambah kontak" onClick={() => setEditModal({})}><Icon icon={Plus} size="sm" /></button>
      </header>

      <div className="pasv-pro__body">
        <div className="pasv-pro__info-callout">Kontak darurat akan dihubungi secara otomatis saat terjadi keadaan darurat dalam perjalanan.</div>
        {contacts.length === 0 ? (
          <EmptyState icon={Phone} title="Belum ada kontak darurat" description="Tambahkan minimal 1 kontak untuk keamanan." action={<Button variant="primary" onClick={() => setEditModal({})}>Tambah Kontak</Button>} />
        ) : (
          contacts.map((c) => (
            <div key={c.id} className={`pasv-pro__contact${c.isPrimary ? ' pasv-pro__contact--primary' : ''}`}>
              <Avatar size="sm">{c.name?.[0] || '?'}</Avatar>
              <div className="pasv-pro__contact-info">
                <div className="pasv-pro__contact-name">{c.name}{c.isPrimary && <span className="pasv-pro__badge-util">Utama</span>}</div>
                <div className="pasv-pro__contact-detail">{c.phone} · {c.relationship}</div>
                {c.verified && <div className="pasv-pro__contact-verified"><CheckCircle size={11} /> Terverifikasi</div>}
              </div>
              <div className="pasv-pro__contact-actions">
                <button type="button" className="pasv-pro__addr-act" aria-label="Edit" onClick={() => setEditModal(c)}><Edit3 size={14} /></button>
                <button type="button" className="pasv-pro__addr-act pasv-pro__addr-act--danger" aria-label="Hapus" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {editModal && <ContactForm contact={editModal} onSave={handleSave} onClose={() => setEditModal(null)} />}
      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

function ContactForm({ contact, onSave, onClose }) {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [relationship, setRelationship] = useState(contact?.relationship || 'family');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    await onSave({ name: name.trim(), phone: phone.trim(), relationship });
  };

  return (
    <div className="pasv-pro__overlay" onClick={onClose}>
      <div className="pasv-pro__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={contact?.id ? 'Edit kontak' : 'Tambah kontak'}>
        <header className="pasv-pro__modal-header">
          <h2 className="pasv-pro__modal-title">{contact?.id ? 'Edit Kontak' : 'Tambah Kontak Darurat'}</h2>
          <button type="button" className="pasv-pro__icon-btn" aria-label="Tutup" onClick={onClose}><Icon icon={X} size="sm" /></button>
        </header>
        <form className="pasv-pro__modal-body" onSubmit={handleSubmit}>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Nama</label>
            <input className="pasv-pro__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kontak" required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Nomor Telepon</label>
            <input className="pasv-pro__input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+628xxxxxxxxxx" type="tel" required />
          </div>
          <div className="pasv-pro__field">
            <label className="pasv-pro__label">Hubungan</label>
            <select className="pasv-pro__input pasv-pro__select" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <option value="family">Keluarga</option>
              <option value="spouse">Pasangan</option>
              <option value="friend">Teman</option>
              <option value="colleague">Rekan Kerja</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="pasv-pro__actions">
            <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" type="submit" disabled={!name.trim() || !phone.trim()}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
