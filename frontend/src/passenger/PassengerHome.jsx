import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar, NotificationBell, SearchBar, Card, MetricWidget, KPIGrid, ActivityFeed,
  StatusIndicator, MapContainer, DriverMarker, Loading, Skeleton, EmptyState, ErrorState, Button, Icon,
} from '../design-system/index.js';
import {
  Home, MapPin, Car, Package, Coffee, Utensils, Wallet, Bell, Navigation,
  TrendingUp, Clock, Sparkles, History, Map as MapIcon, WifiOff, User,
} from 'lucide-react';
import * as papi from './api.js';
import './passenger.css';

const QUICK = [
  { id: 'ride', label: 'Ride', icon: Car, color: '#4f46e5', enabled: true },
  { id: 'delivery', label: 'Delivery', icon: Package, color: '#0ea5e9', enabled: false },
  { id: 'food', label: 'Food', icon: Utensils, color: '#f97316', enabled: false },
  { id: 'package', label: 'Package', icon: Coffee, color: '#10b981', enabled: false },
];
const TONE_BG = { primary: 'var(--ds-color-primary)', success: 'var(--ds-color-success)', warning: 'var(--ds-color-warning)', info: 'var(--ds-color-info)', danger: 'var(--ds-color-danger)' };

export default function PassengerHome({ user, onNavigate, onTopUp, onWalletHistory, onSearchDestination, onNotifications }) {
  const [state, setState] = useState('loading'); // loading | ready | error | offline
  const [data, setData] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  const load = useCallback(async () => {
    if (!navigator.onLine) { setState('offline'); return; }
    setState('loading');
    try {
      const [promos, wallet, recent, favs, trips, drivers, loc] = await Promise.all([
        papi.getPromotions(), papi.getWallet(), papi.getRecentDestinations(),
        papi.getFavorites(), papi.getRecentTrips(), papi.getNearbyDrivers(), papi.getCurrentLocation(),
      ]);
      setData({ promos, wallet, recent, favs, trips, drivers, loc });
      setState('ready');
    } catch (e) {
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => { setOnline(true); if (state === 'offline') load(); };
    const off = () => { setOnline(false); setState('offline'); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [load, state]);

  const name = user?.name || user?.email?.split('@')[0] || 'Rider';
  const firstName = name.split(' ')[0];

  if (state === 'loading') {
    return (
      <div className="pasv-app" aria-busy="true">
        <AppBarSkeleton user={user} />
        <div className="pasv-scroll">
          <div style={{ padding: 16 }}>
            <Skeleton variant="card" lines={2} />
            <div style={{ marginTop: 12 }}><Skeleton variant="card" lines={3} /></div>
            <div style={{ marginTop: 12 }}><Skeleton variant="list" lines={4} /></div>
          </div>
        </div>
      </div>
    );
  }
  if (state === 'offline') {
    return (
      <div className="pasv-app">
        <AppBar user={user} onNotifications={onNotifications} onWallet={onTopUp} />
        <div className="pasv-offline"><Icon icon={WifiOff} size="sm" /> Mode offline — periksa koneksi internet Anda.</div>
        <div className="pasv-scroll">
          <ErrorState title="Tidak ada koneksi" description="Buka internet untuk memuat beranda." action={<Button onClick={load}>Coba lagi</Button>} />
        </div>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="pasv-app">
        <AppBar user={user} onNotifications={onNotifications} onWallet={onTopUp} />
        <div className="pasv-scroll">
          <ErrorState title="Gagal memuat beranda" description="Terjadi kesalahan saat mengambil data." action={<Button onClick={load}>Muat ulang</Button>} />
        </div>
      </div>
    );
  }

  const { promos, wallet, recent, favs, trips, drivers, loc } = data;

  return (
    <div className="pasv-app">
      <AppBar
        user={user}
        onNotifications={onNotifications}
        onWallet={onWalletHistory ?? onTopUp}
        unread={0}
      />
      <main className="pasv-scroll">
        {/* Greeting + location */}
        <section aria-label="Lokasi saat ini">
          <h1 className="pasv-greeting">Halo, {firstName}<small>Mau ke mana hari ini?</small></h1>
          <div className="pasv-location" style={{ marginTop: 'var(--ds-space-3)' }}>
            <span className="pasv-location__pin"><Icon icon={MapPin} size="md" /></span>
            <div className="pasv-location__body">
              <div className="pasv-location__addr">{loc.address}</div>
              <StatusIndicator tone={loc.permission === 'granted' ? 'success' : 'warning'} label={loc.permission === 'granted' ? 'Izin lokasi aktif' : 'Izin lokasi ditolak'} pulse={loc.permission === 'granted'} />
            </div>
            <button type="button" className="pasv-location__change" onClick={() => onNavigate?.('location')}>Ganti</button>
          </div>
        </section>

        {/* Search destination */}
        <section aria-label="Cari tujuan">
          <div className="pasv-search-dest" role="search" tabIndex={0} onClick={() => (onSearchDestination ?? onNavigate)?.('booking:ride')} onKeyDown={(e) => { if (e.key === 'Enter') (onSearchDestination ?? onNavigate)?.('booking:ride'); }}>
            <Icon icon={Navigation} size="md" />
            <span className="pasv-search-dest__text">Ke mana tujuan Anda?</span>
          </div>
        </section>

        {/* Quick services */}
        <section aria-label="Layanan cepat">
          <div className="pasv-quick">
            {QUICK.map((q) => (
              <button key={q.id} type="button" className="pasv-quick__card" disabled={!q.enabled} onClick={() => q.enabled && onNavigate?.(`booking:${q.id}`)} aria-label={q.label}>
                <span className="pasv-quick__icon" style={{ background: q.color }}><Icon icon={q.icon} size="md" /></span>
                <span className="pasv-quick__label">{q.label}</span>
                {!q.enabled && <span className="pasv-quick__soon">Segera</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Promotions */}
        <section aria-label="Promosi">
          <div className="pasv-section__head">
            <h2 className="pasv-section__title">Promo untukmu</h2>
            <button type="button" className="pasv-section__more" onClick={() => onNavigate?.('promotions')}>Lihat semua</button>
          </div>
          {promos.length === 0
            ? <EmptyState title="Belum ada promo" description="Promo akan muncul di sini." />
            : <div className="pasv-promos">
                {promos.map((p) => (
                  <article key={p.id} className="pasv-promo" style={{ background: `linear-gradient(135deg, ${TONE_BG[p.tone] || TONE_BG.primary}, #7c3aed)` }}>
                    <div className="pasv-promo__title">{p.title}</div>
                    <div className="pasv-promo__sub">{p.subtitle}</div>
                    <span className="pasv-promo__code">{p.code}</span>
                  </article>
                ))}
              </div>}
        </section>

        {/* Recent destinations */}
        <section aria-label="Tujuan terakhir">
          <div className="pasv-section__head">
            <h2 className="pasv-section__title">Tujuan terakhir</h2>
          </div>
          {recent.length === 0 ? <EmptyState title="Belum ada tujuan" /> : recent.map((d) => (
            <button key={d.id} type="button" className="pasv-dest" onClick={() => onNavigate?.(`dest:${d.id}`)} style={{ marginBottom: 'var(--ds-space-2)' }}>
              <span className="pasv-dest__icon"><Icon icon={MapPin} size="sm" /></span>
              <span className="pasv-dest__body"><span className="pasv-dest__title">{d.title}</span><span className="pasv-dest__sub">{d.subtitle}</span></span>
            </button>
          ))}
        </section>

        {/* Favorite places */}
        <section aria-label="Tempat favorit">
          <div className="pasv-section__head">
            <h2 className="pasv-section__title">Tempat favorit</h2>
            <button type="button" className="pasv-section__more" onClick={() => onNavigate?.('favorites')}>Kelola</button>
          </div>
          {favs.length === 0 ? <EmptyState title="Belum ada favorit" /> : favs.map((f) => (
            <button key={f.id} type="button" className="pasv-dest" onClick={() => onNavigate?.(`fav:${f.id}`)} style={{ marginBottom: 'var(--ds-space-2)' }}>
              <span className="pasv-dest__icon"><Icon icon={MapPin} size="sm" /></span>
              <span className="pasv-dest__body"><span className="pasv-dest__title">{f.title}</span><span className="pasv-dest__sub">{f.subtitle}</span></span>
            </button>
          ))}
        </section>

        {/* Nearby drivers (summary) */}
        <section aria-label="Driver terdekat">
          <div className="pasv-section__head">
            <h2 className="pasv-section__title">Driver terdekat</h2>
            <StatusIndicator tone="success" label="Tersedia" pulse />
          </div>
          <div className="pasv-drivers">
            {drivers.map((d) => (
              <div key={d.id} className="pasv-driver">
                <Avatar name={d.name} size="sm" status="online" />
                <div className="pasv-driver__meta">
                  <div className="pasv-driver__name">{d.name} · ★ {d.rating}</div>
                  <div className="pasv-driver__veh">{d.vehicle} · {d.distance}</div>
                </div>
                <div className="pasv-driver__eta"><b>{d.eta}</b><span>menit</span></div>
              </div>
            ))}
          </div>
          {/* Map summary (no booking flow) */}
          <div className="pasv-map-mini" style={{ marginTop: 'var(--ds-space-3)' }}>
            <MapContainer height={160}>
              {drivers.map((d, i) => <DriverMarker key={d.id} position={[20 + i * 22, 55 + (i % 2) * 18]} label={d.name} />)}
            </MapContainer>
          </div>
        </section>

        {/* Wallet summary */}
        <section aria-label="Dompet">
          <div className="pasv-wallet">
            <div className="pasv-wallet__balance">
              <div className="pasv-wallet__label">Saldo dompet</div>
              <div className="pasv-wallet__amount">Rp {Number(wallet.balance).toLocaleString('id-ID')}</div>
            </div>
            <div className="pasv-wallet__actions">
              <button type="button" className="pasv-wallet__btn pasv-wallet__btn--topup" onClick={onTopUp}>Top Up</button>
              <button type="button" className="pasv-wallet__btn pasv-wallet__btn--hist" onClick={onWalletHistory}>Riwayat</button>
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section aria-label="Aktivitas terbaru">
          <div className="pasv-section__head">
            <h2 className="pasv-section__title">Aktivitas terbaru</h2>
            <button type="button" className="pasv-section__more" onClick={() => onNavigate?.('activity')}>Semua</button>
          </div>
          {trips.length === 0
            ? <EmptyState title="Belum ada perjalanan" description="Trip selesai akan muncul di sini." />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
                {trips.map((t) => (
                  <div key={t.id} className="pasv-activity__item">
                    <span className="pasv-activity__icon"><Icon icon={History} size="sm" /></span>
                    <div className="pasv-activity__body">
                      <div className="pasv-activity__title">{t.title}</div>
                      <div className="pasv-activity__date">{t.date}</div>
                    </div>
                    <span className="pasv-activity__price">{t.price}</span>
                  </div>
                ))}
              </div>}
        </section>
      </main>
    </div>
  );
}

function AppBar({ user, onNotifications, onWallet, unread }) {
  const initial = (user?.name || user?.email || 'R').trim().charAt(0).toUpperCase();
  return (
    <header className="pasv-appbar">
      <Avatar name={user?.name || user?.email} size="md" status="online" />
      <div className="pasv-appbar__id">
        <h1 className="pasv-greeting" style={{ fontSize: 'var(--ds-text-body-size)' }}>Halo, {user?.name?.split(' ')[0] || 'Rider'}</h1>
      </div>
      <div className="pasv-appbar__actions">
        <button type="button" className="pasv-wallet-chip" onClick={onWallet} aria-label="Dompet"><Icon icon={Wallet} size="sm" /> Dompet</button>
        <NotificationBell items={unread ? [{ id: 'u', title: 'Notifikasi', unread: true }] : []} onRead={() => onNotifications?.()} />
        <button type="button" className="pasv-iconbtn" aria-label="Profil" onClick={() => onNotifications?.('profile')}><Icon icon={User} size="sm" /></button>
      </div>
    </header>
  );
}

function AppBarSkeleton({ user }) {
  return (
    <header className="pasv-appbar">
      <Avatar name={user?.name || user?.email} size="md" />
      <div className="pasv-appbar__id"><div className="pasv-greeting" style={{ fontSize: 'var(--ds-text-body-size)' }}>…</div></div>
      <div className="pasv-appbar__actions"><span className="pasv-iconbtn" /><span className="pasv-iconbtn" /></div>
    </header>
  );
}
