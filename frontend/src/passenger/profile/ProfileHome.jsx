import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Avatar, Badge, Icon, Button, Skeleton, EmptyState, ErrorState,
} from '../../design-system/index.js';
import {
  ChevronRight, User, MapPin, AlertTriangle, CreditCard, Bell, Globe, Moon, Accessibility,
  Lock, Shield, Smartphone, Clock, FileText, Info, LogOut, ShieldAlert, Wallet,
  Home, Building, Coffee, Star, Phone, HelpCircle, Settings, Mail, CheckCircle, WifiOff, Loader,
} from 'lucide-react';
import * as papi from '../api.js';
import './profile.css';

const QUICK_ACTIONS = [
  { id: 'personalInfo', label: 'Data Diri', icon: User, color: '#4f46e5' },
  { id: 'addresses', label: 'Alamat', icon: MapPin, color: '#16a34a' },
  { id: 'emergency', label: 'Darurat', icon: Phone, color: '#dc2626' },
  { id: 'payments', label: 'Pembayaran', icon: CreditCard, color: '#2563eb' },
];

const SETTINGS_SECTIONS = [
  {
    key: 'preferences',
    title: 'Preferensi',
    items: [
      { id: 'notifications', label: 'Notifikasi', hint: 'Suara, getar, pop-up', icon: Bell, color: '#8b5cf6' },
      { id: 'language', label: 'Bahasa', hint: 'Indonesia', icon: Globe, color: '#14b8a6' },
      { id: 'theme', label: 'Tema', hint: 'Sesuai sistem', icon: Moon, color: '#6b7280' },
      { id: 'accessibility', label: 'Aksesibilitas', hint: 'Ukuran teks, kontras', icon: Accessibility, color: '#ec4899' },
    ],
  },
  {
    key: 'security',
    title: 'Keamanan',
    items: [
      { id: 'password', label: 'Ubah Password', icon: Lock, color: '#d97706' },
      { id: 'twoFactor', label: 'Autentikasi Dua Faktor', hint: 'Tingkatkan keamanan', icon: Shield, color: '#4f46e5' },
      { id: 'devices', label: 'Perangkat Dipercaya', hint: '3 perangkat aktif', icon: Smartphone, color: '#2563eb' },
      { id: 'loginHistory', label: 'Riwayat Login', icon: Clock, color: '#6b7280' },
    ],
  },
];

export default function ProfileHome({ user, onNavigate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);

  const load = useCallback(async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [p, w] = await Promise.all([
        papi.getProfile(user),
        papi.getWallet().catch(() => ({ balance: 0, currency: 'IDR' })),
      ]);
      setProfile(p); setWallet(w);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [user, offline]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [p, w] = await Promise.all([
        papi.getProfile(user),
        papi.getWallet().catch(() => ({ balance: 0, currency: 'IDR' })),
      ]);
      setProfile(p); setWallet(w);
    } catch {}
    finally { setRefreshing(false); }
  };

  const memberSince = profile ? new Date(profile.memberSince).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '';

  if (loading) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar"><h1 className="pasv-pro__title">Profil</h1></header>
        <div className="pasv-pro__skeleton">
          <div className="pasv-pro__skeleton-row"><Skeleton variant="circle" width={60} height={60} /><div style={{ flex: 1 }}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></div></div>
          {[0,1,2,3].map((i) => (<Skeleton key={i} variant="rounded" width="100%" height={48} />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar"><h1 className="pasv-pro__title">Profil</h1></header>
        <div className="pasv-pro__body">
          <ErrorState icon={AlertTriangle} title="Gagal memuat profil" description="Periksa koneksi Anda." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />
        </div>
      </div>
    );
  }

  if (offline) {
    return (
      <div className="pasv-pro">
        <header className="pasv-pro__bar"><h1 className="pasv-pro__title">Profil</h1></header>
        <div className="pasv-pro__body">
          <EmptyState icon={WifiOff} title="Mode offline" description="Data profil tidak tersedia saat offline." />
        </div>
      </div>
    );
  }

  return (
    <div className="pasv-pro">
      <header className="pasv-pro__bar">
        <h1 className="pasv-pro__title">Profil</h1>
        <span className="pasv-pro__bar-spacer" />
        <button type="button" className="pasv-pro__icon-btn" aria-label="Pengaturan akun" onClick={() => onNavigate?.('account')}>
          <Icon icon={Settings} size="sm" />
        </button>
      </header>

      <div className="pasv-pro__body">
        {refreshing && (
          <div className="pasv-pro__refresh" role="status" aria-live="polite">
            <span className="pasv-pro__refresh-spin"><Icon icon={Loader} size="sm" /></span>
            <span>Memuat ulang...</span>
          </div>
        )}

        {/* User Card */}
        <div className="pasv-pro__user" role="region" aria-label="Informasi pengguna">
          <div className="pasv-pro__user-avatar" aria-hidden="true">
            {profile.avatar ? <img src={profile.avatar} alt="" /> : <User size={28} />}
          </div>
          <div className="pasv-pro__user-info">
            <div className="pasv-pro__user-name">{profile.name}</div>
            <div className="pasv-pro__user-phone">{profile.phone}</div>
            <div className="pasv-pro__user-email">{profile.email}</div>
            <div className="pasv-pro__user-badge">
              <CheckCircle size={12} /> {profile.verified ? 'Terverifikasi' : 'Belum verifikasi'}
            </div>
          </div>
        </div>

        {/* Wallet Summary */}
        {wallet && (
          <div className="pasv-pro__card">
            <div className="pasv-pro__stat" onClick={() => onNavigate?.('payments')} role="button" tabIndex={0} aria-label="Saldo dompet" onKeyDown={(e) => e.key === 'Enter' && onNavigate?.('payments')}>
              <span className="pasv-pro__stat-value">Rp {wallet.balance.toLocaleString('id-ID')}</span>
              <span className="pasv-pro__stat-label">Saldo Dompet</span>
              <span style={{ marginLeft: 'auto' }}><ChevronRight size={16} color="var(--ds-color-text-muted)" /></span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pasv-pro__card">
          <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">Akses Cepat</h2></div>
          <div className="pasv-pro__quick">
            {QUICK_ACTIONS.map((qa) => (
              <button key={qa.id} type="button" className="pasv-pro__quick-item" onClick={() => onNavigate?.(qa.id)} aria-label={qa.label}>
                <span className="pasv-pro__quick-icon" style={{ background: qa.color }}><Icon icon={qa.icon} size="sm" /></span>
                <span>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.key} className="pasv-pro__card">
            <div className="pasv-pro__card-head"><h2 className="pasv-pro__card-title">{section.title}</h2></div>
            {section.items.map((item) => (
              <div key={item.id} className="pasv-pro__row" role="button" tabIndex={0} aria-label={item.label}
                onClick={() => onNavigate?.(item.id)}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate?.(item.id)}
              >
                <span className={`pasv-pro__row-icon pasv-pro__row-icon--${item.color === '#4f46e5' ? 'primary' : item.color === '#16a34a' ? 'success' : item.color === '#dc2626' ? 'danger' : item.color === '#2563eb' ? 'info' : item.color === '#d97706' ? 'warning' : item.color === '#8b5cf6' ? 'purple' : item.color === '#14b8a6' ? 'teal' : item.color === '#ec4899' ? 'pink' : 'neutral'}`}
                  style={{ background: item.color }}>
                  <Icon icon={item.icon} size="sm" />
                </span>
                <span className="pasv-pro__row-body">
                  <div className="pasv-pro__row-label">{item.label}</div>
                  {item.hint && <div className="pasv-pro__row-hint">{item.hint}</div>}
                </span>
                <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
              </div>
            ))}
          </div>
        ))}

        {/* Footer Links */}
        <div className="pasv-pro__card">
          <button type="button" className="pasv-pro__row" onClick={() => onNavigate?.('help')} aria-label="Pusat Bantuan">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--info"><HelpCircle size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Pusat Bantuan</div></span>
            <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
          </button>
          <button type="button" className="pasv-pro__row" onClick={() => onNavigate?.('account')} aria-label="Kelola Akun">
            <span className="pasv-pro__row-icon pasv-pro__row-icon--neutral"><Settings size={18} /></span>
            <span className="pasv-pro__row-body"><div className="pasv-pro__row-label">Kelola Akun</div></span>
            <ChevronRight size={16} className="pasv-pro__inline-icon" color="var(--ds-color-text-muted)" />
          </button>
        </div>

        <div className="pasv-pro__footer">
          <button type="button" className="pasv-pro__footer-link" onClick={() => onNavigate?.('privacy')}><FileText size={14} />Kebijakan Privasi</button>
          <button type="button" className="pasv-pro__footer-link" onClick={() => onNavigate?.('terms')}><FileText size={14} />Ketentuan Layanan</button>
          <button type="button" className="pasv-pro__footer-link" onClick={() => onNavigate?.('about')}><Info size={14} />Tentang Aplikasi</button>
          <button type="button" className="pasv-pro__footer-link pasv-pro__footer-link--danger" onClick={() => onNavigate?.('account')}><LogOut size={14} />Keluar</button>
        </div>
      </div>
    </div>
  );
}
