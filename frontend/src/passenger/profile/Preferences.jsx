import React, { useState } from 'react';
import { Icon, Button, Toast } from '../../design-system/index.js';
import { ChevronLeft, Bell, MapPin, Eye, Globe, Volume2, ToggleLeft, Tag, CreditCard, Truck, Save, Mail, MessageSquare, Type } from 'lucide-react';
import './profile.css';

export default function Preferences({ onBack }) {
  const [prefs, setPrefs] = useState({
    pushNotif: true, emailNotif: false, promoNotif: true, tripAlert: true,
    shareLocation: true, readReceipts: false, locationAds: false,
    marketingEmail: false, marketingSMS: false,
    accessibilityReduceAnim: false, accessibilityHighContrast: false, accessibilityLargeText: false,
    autoApplyPromo: true, defaultPayment: 'wallet', defaultVehicle: 'motor',
  });
  const [toast, setToast] = useState(null);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const handleSave = () => setToast({ variant: 'success', message: 'Preferensi disimpan' });

  const ToggleRow = ({ icon: IconComp, label, hint, value, onChange }) => (
    <div className="pasv-pro__row">
      <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><IconComp size={18} /></span>
      <span className="pasv-pro__row-body">
        <div className="pasv-pro__row-label">{label}</div>
        {hint && <div className="pasv-pro__row-hint">{hint}</div>}
      </span>
      <label className="pasv-pro__switch" aria-label={label}>
        <input type="checkbox" checked={value} onChange={onChange} />
        <span className="pasv-pro__switch-slider" />
      </label>
    </div>
  );

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Preferensi</h1>
      </header>

      <div className="pasv-pro__body">
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Notifikasi</h2></div>
          <ToggleRow icon={Bell} label="Notifikasi Push" value={prefs.pushNotif} onChange={() => toggle('pushNotif')} />
          <ToggleRow icon={Mail} label="Notifikasi Email" value={prefs.emailNotif} onChange={() => toggle('emailNotif')} />
          <ToggleRow icon={Tag} label="Promo & Penawaran" value={prefs.promoNotif} onChange={() => toggle('promoNotif')} />
          <ToggleRow icon={MapPin} label="Peringatan Perjalanan" hint="Info lalu lintas, cuaca" value={prefs.tripAlert} onChange={() => toggle('tripAlert')} />
        </div>

        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Lokasi & Privasi</h2></div>
          <ToggleRow icon={MapPin} label="Bagikan Lokasi" hint="Saat aplikasi aktif" value={prefs.shareLocation} onChange={() => toggle('shareLocation')} />
          <ToggleRow icon={Eye} label="Konfirmasi Dibaca" hint="Driver lihat status baca" value={prefs.readReceipts} onChange={() => toggle('readReceipts')} />
          <ToggleRow icon={Globe} label="Iklan Berdasarkan Lokasi" value={prefs.locationAds} onChange={() => toggle('locationAds')} />
        </div>

        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Pemasaran</h2></div>
          <ToggleRow icon={Mail} label="Email Promosi" value={prefs.marketingEmail} onChange={() => toggle('marketingEmail')} />
          <ToggleRow icon={MessageSquare} label="SMS Promosi" value={prefs.marketingSMS} onChange={() => toggle('marketingSMS')} />
        </div>

        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Aksesibilitas</h2></div>
          <ToggleRow icon={Volume2} label="Kurangi Animasi" value={prefs.accessibilityReduceAnim} onChange={() => toggle('accessibilityReduceAnim')} />
          <ToggleRow icon={Eye} label="Kontras Tinggi" value={prefs.accessibilityHighContrast} onChange={() => toggle('accessibilityHighContrast')} />
          <ToggleRow icon={Type} label="Teks Besar" value={prefs.accessibilityLargeText} onChange={() => toggle('accessibilityLargeText')} />
        </div>

        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Lainnya</h2></div>
          <ToggleRow icon={Tag} label="Auto Apply Promo" hint="Terapkan promo terbaik otomatis" value={prefs.autoApplyPromo} onChange={() => toggle('autoApplyPromo')} />
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--info"><CreditCard size={18} /></span>
            <span className="pasv-pro__row-body">
              <div className="pasv-pro__row-label">Pembayaran Default</div>
            </span>
            <select className="pasv-pro__select-sm" value={prefs.defaultPayment} onChange={(e) => setPrefs((p) => ({ ...p, defaultPayment: e.target.value }))}>
              <option value="wallet">Dompet</option>
              <option value="card">Kartu</option>
              <option value="bank">Transfer Bank</option>
            </select>
          </div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--success"><Truck size={18} /></span>
            <span className="pasv-pro__row-body">
              <div className="pasv-pro__row-label">Kendaraan Default</div>
            </span>
            <select className="pasv-pro__select-sm" value={prefs.defaultVehicle} onChange={(e) => setPrefs((p) => ({ ...p, defaultVehicle: e.target.value }))}>
              <option value="motor">Motor</option>
              <option value="car">Mobil</option>
              <option value="carX">Mobil X</option>
            </select>
          </div>
        </div>

        <div className="pasv-pro__actions">
          <Button variant="primary" onClick={handleSave}><Save size={14} /> Simpan Pengaturan</Button>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
