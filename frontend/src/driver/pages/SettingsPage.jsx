import React from 'react';
import { Card, Text, Heading, Flex } from '../../design-system/index.js';
import { ChevronLeft, Bell, Globe, Lock, Moon, LogOut, ChevronRight, Shield, Save } from 'lucide-react';

const SETTINGS_GROUPS = [
  {
    label: 'Notifikasi',
    items: [
      { id: 'sound', label: 'Suara Notifikasi', type: 'toggle', value: true },
      { id: 'vibrate', label: 'Getar', type: 'toggle', value: true },
      { id: 'new_order_sound', label: 'Suara Pesanan Baru', type: 'toggle', value: true },
      { id: 'promo', label: 'Promo & Penawaran', type: 'toggle', value: false },
    ],
  },
  {
    label: 'Navigasi',
    items: [
      { id: 'nav_app', label: 'Aplikasi Navigasi', type: 'select', value: 'Google Maps', options: ['Google Maps', 'Waze', 'Maps'] },
      { id: 'auto_nav', label: 'Buka Navigasi Otomatis', type: 'toggle', value: false },
    ],
  },
  {
    label: 'Trip',
    items: [
      { id: 'auto_accept', label: 'Terima Pesanan Otomatis', type: 'toggle', value: false, desc: 'Terima pesanan tanpa notifikasi' },
      { id: 'max_distance', label: 'Jarak Maksimal', type: 'select', value: '10 km', options: ['5 km', '10 km', '15 km', '20 km'] },
      { id: 'pref_area', label: 'Area Operasi', type: 'select', value: 'Jakarta Pusat', options: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur'] },
    ],
  },
];

const STORAGE_KEY = 'driver_settings';

export default function SettingsPage({ onBack, onLogout, onNavigate }) {
  const [settings, setSettings] = React.useState(() => {
    const s = {};
    SETTINGS_GROUPS.forEach((g) => g.items.forEach((item) => { s[item.id] = item.value; }));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { Object.assign(s, JSON.parse(saved)); } catch {}
    }
    return s;
  });

  const [hasChanges, setHasChanges] = React.useState(false);

  const toggle = (id) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    setHasChanges(true);
  };

  const updateSetting = (id, value) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setHasChanges(false);
  };

  const resetSettings = () => {
    SETTINGS_GROUPS.forEach((g) => g.items.forEach((item) => {
      setSettings((prev) => ({ ...prev, [item.id]: item.value }));
    }));
    setHasChanges(true);
  };

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Pengaturan</h2>
      </header>

      <div className="drv-page-body">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <Heading size="xs" style={{ marginBottom: 8 }}>{group.label}</Heading>
            <Card>
              {group.items.map((item) => (
                <div key={item.id} className="drv-settings-item">
                  <div style={{ flex: 1 }}>
                    <Text size="sm">{item.label}</Text>
                    {item.desc && <Text size="xs" color="muted">{item.desc}</Text>}
                  </div>
                  {item.type === 'toggle' ? (
                    <div
                      className={`drv-toggle ${settings[item.id] ? 'drv-toggle--active' : ''}`}
                      onClick={() => toggle(item.id)}
                    >
                      <div className="drv-toggle__knob" />
                    </div>
                  ) : (
                    <Flex gap={4} style={{ alignItems: 'center' }}>
                      <select
                        className="drv-select"
                        value={settings[item.id]}
                        onChange={(e) => updateSetting(item.id, e.target.value)}
                      >
                        {item.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronRight size={14} color="var(--ds-color-text-muted)" />
                    </Flex>
                  )}
                </div>
              ))}
            </Card>
          </div>
        ))}

        <div style={{ marginTop: 24 }}>
          {hasChanges && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className="drv-btn btn-secondary" onClick={saveSettings}><Save size={14} /> Simpan</button>
              <button className="drv-btn btn-secondary" onClick={resetSettings}>Reset</button>
            </div>
          )}
          <Card style={{ marginBottom: 8, cursor: 'pointer' }}
            onClick={() => onNavigate?.('tab', { id: 'safety' })}>
            <Flex gap={12} style={{ alignItems: 'center' }}>
              <Shield size={20} color="var(--ds-color-primary)" />
              <Text size="sm">Keamanan & Privasi</Text>
              <ChevronRight size={16} color="var(--ds-color-text-muted)" style={{ marginLeft: 'auto' }} />
            </Flex>
          </Card>
          <Card style={{ cursor: 'pointer' }} onClick={onLogout}>
            <Flex gap={12} style={{ alignItems: 'center' }}>
              <LogOut size={20} color="var(--ds-color-danger)" />
              <Text size="sm" style={{ color: 'var(--ds-color-danger)' }}>Keluar</Text>
              <ChevronRight size={16} color="var(--ds-color-text-muted)" style={{ marginLeft: 'auto' }} />
            </Flex>
          </Card>
        </div>

        <Text size="xs" color="muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Versi 1.0.0
        </Text>
      </div>
    </div>
  );
}
