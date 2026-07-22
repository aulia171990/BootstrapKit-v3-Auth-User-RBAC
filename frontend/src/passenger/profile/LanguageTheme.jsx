import React, { useState } from 'react';
import { Icon, Button, Toast } from '../../design-system/index.js';
import { ChevronLeft, Globe, Moon, Sun, Monitor, Type, Eye, Volume2, Save } from 'lucide-react';
import './profile.css';

const LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia', native: 'Indonesia' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'jv', label: 'Basa Jawa', native: 'Jawa' },
];

const THEMES = [
  { id: 'light', label: 'Terang', icon: Sun },
  { id: 'dark', label: 'Gelap', icon: Moon },
  { id: 'system', label: 'Sesuai Sistem', icon: Monitor },
];

export default function LanguageTheme({ onBack }) {
  const [lang, setLang] = useState('id');
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState(16);
  const [accessibility, setAccessibility] = useState({ reduceAnim: false, highContrast: false, boldText: false });
  const [toast, setToast] = useState(null);

  const applyTheme = (t) => {
    setTheme(t);
    if (t === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const handleSave = () => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    setToast({ variant: 'success', message: 'Preferensi bahasa & tema disimpan' });
  };

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <button type="button" className="pasv-pro__icon-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
        <h1 className="pasv-pro__title">Bahasa & Tema</h1>
      </header>

      <div className="pasv-pro__body">
        {/* Language */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Bahasa</h2></div>
          {LANGUAGES.map((l) => (
            <label key={l.code} className={`pasv-pro__radio${lang === l.code ? ' pasv-pro__radio--active' : ''}`}>
              <input type="radio" name="lang" value={l.code} checked={lang === l.code} onChange={() => setLang(l.code)} />
              <div className="pasv-pro__radio-body">
                <div className="pasv-pro__radio-label">{l.native}</div>
                <div className="pasv-pro__radio-hint">{l.label}</div>
              </div>
              <span className={`pasv-pro__radio-dot${lang === l.code ? ' pasv-pro__radio-dot--active' : ''}`} />
            </label>
          ))}
        </div>

        {/* Theme */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Tema</h2></div>
          <div className="pasv-pro__theme-grid">
            {THEMES.map((t) => {
              const IconComp = t.icon;
              return (
                <button key={t.id} type="button" className={`pasv-pro__theme-card${theme === t.id ? ' pasv-pro__theme-card--active' : ''}`}
                  onClick={() => applyTheme(t.id)} aria-label={t.label}
                >
                  <IconComp size={24} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Ukuran Teks</h2></div>
          <div className="pasv-pro__field">
            <div className="pasv-pro__slider-row">
              <Type size={14} />
              <input type="range" min={12} max={24} step={1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="pasv-pro__slider" aria-label="Ukuran teks" />
              <Type size={20} />
            </div>
            <div className="pasv-pro__slider-value">{fontSize}px</div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Aksesibilitas</h2></div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><Volume2 size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Kurangi Animasi</div></span>
            <label className="pasv-pro__switch"><input type="checkbox" checked={accessibility.reduceAnim} onChange={() => setAccessibility((p) => ({ ...p, reduceAnim: !p.reduceAnim }))} /><span className="pasv-pro__switch-slider" /></label>
          </div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><Eye size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Kontras Tinggi</div></span>
            <label className="pasv-pro__switch"><input type="checkbox" checked={accessibility.highContrast} onChange={() => setAccessibility((p) => ({ ...p, highContrast: !p.highContrast }))} /><span className="pasv-pro__switch-slider" /></label>
          </div>
          <div className="pasv-pro__row">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><Type size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Teks Tebal</div></span>
            <label className="pasv-pro__switch"><input type="checkbox" checked={accessibility.boldText} onChange={() => setAccessibility((p) => ({ ...p, boldText: !p.boldText }))} /><span className="pasv-pro__switch-slider" /></label>
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
