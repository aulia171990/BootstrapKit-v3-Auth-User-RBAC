import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Badge, Skeleton, EmptyState, ErrorState } from '../../design-system/index.js';
import { theme } from '../../design-system/index.js';
import {
  Plus, Send, CreditCard, History, Tag, RefreshCw, Eye, EyeOff,
  TrendingUp, AlertTriangle, WifiOff, ArrowUpRight, ArrowDownLeft, ArrowRightLeft,
  ShieldCheck, Moon, Sun, ChevronRight, Wallet as WalletIcon,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import { usePullToRefresh } from './usePullToRefresh.js';
import PaymentVoucherSheet from './PaymentVoucherSheet.jsx';
import './wallet.css';

const TX_ICON = {
  trip: ArrowUpRight, topup: ArrowDownLeft, cashback: TrendingUp, transfer: ArrowRightLeft,
  refund: ArrowDownLeft, withdrawal: ArrowUpRight, adjustment: ArrowRightLeft,
};
const TX_TONE = {
  trip: 'danger', topup: 'success', cashback: 'success', transfer: 'primary',
  refund: 'success', withdrawal: 'danger', adjustment: 'primary',
};
const RECENT_LIMIT = 5;

function fmtAmt(n) {
  const sign = n < 0 ? '-' : '+';
  return `${sign} ${formatIDR(Math.abs(n))}`;
}
function money(n) { return formatIDR(n); }
function showMoney(n, hidden) { return hidden ? 'Rp ••••••' : money(n); }

/**
 * WalletHome — Passenger Wallet dashboard (mobile-first, premium ride-hailing look).
 *
 * REUSES (no duplicated business logic):
 *   - papi.getWallet / getTransactions / getPromotions / getPaymentMethods / getCashbackSummary
 *     → all backed by the real backend Wallet + Payment + Promotion APIs
 *     (no balance/history/status is computed on the frontend; everything comes
 *     from /api/v1/wallet|payment|promotions).
 *   - formatIDR (shared Pricing Engine) for all currency formatting
 *   - design-system Button / Icon / Badge / Skeleton / EmptyState / ErrorState / Sheet
 *   - PaymentVoucherSheet (bottom sheet) for payment-method + voucher selection
 *
 * Layout (syarat tampilan modern & konsisten ride-hailing premium):
 *   1. Balance card BESAR di bagian atas + tombol hide/show saldo.
 *   2. Top Up sebagai tombol aksi utama (primary CTA) di bawah balance.
 *   3. 5 transaksi terakhir + tombol "View All".
 *   4. Bottom sheet untuk memilih metode pembayaran & voucher (saat Top Up / bayar).
 *
 * States: loading (Skeleton), empty, offline (banner + retry), error.
 */
function WalletHome({
  onTopUp, onTransfer, onPaymentMethods, onHistory, onPromo, onSecurity, onRefresh, onRetry,
  onPickPayment,
}) {
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState(null);
  const [promos, setPromos] = useState([]);
  const [methods, setMethods] = useState(null);
  const [cashback, setCashback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [hidden, setHidden] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [dark, setDark] = useState(() => (typeof theme !== 'undefined' ? theme.get() === 'dark' : false));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [picked, setPicked] = useState(null);

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    theme.set(next);
    setDark(!dark);
  };

  const load = async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [w, t, p, m, c] = await Promise.all([
        papi.getWallet(),
        papi.getTransactions(RECENT_LIMIT),
        papi.getPromotions(),
        papi.getPaymentMethods(),
        papi.getCashbackSummary(),
      ]);
      setWallet(w); setTxs(t); setPromos(p); setMethods(m); setCashback(c);
      setUpdatedAt(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline]);

  const refresh = () => { onRefresh?.(); load(); };
  const { containerRef, pullDistance, refreshing } = usePullToRefresh(refresh);

  const recent = useMemo(() => txs || [], [txs]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="pasv-wallet" aria-busy="true">
        <WalletHeader title="Dompet" />
        <div className="pasv-wallet__body">
          <Skeleton variant="rect" height={220} radius="xl" />
          <div className="pasv-wallet__cta-row">
            <Skeleton variant="rect" height={56} radius="lg" />
            <Skeleton variant="rect" height={56} radius="lg" />
          </div>
          <Skeleton variant="rect" height={260} radius="md" />
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="pasv-wallet">
        <WalletHeader title="Dompet" />
        <div className="pasv-wallet__body">
          <ErrorState
            title="Gagal memuat dompet"
            description="Terjadi kesalahan saat mengambil data dompet Anda."
            action={<Button variant="primary" onClick={() => { setError(false); load(); }}>Coba lagi</Button>}
          />
        </div>
      </div>
    );
  }

  // ---- Offline ----
  if (offline) {
    return (
      <div className="pasv-wallet">
        <WalletHeader title="Dompet" />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden />
          <span className="pasv-conn__msg">Koneksi terputus. Tidak dapat memuat dompet.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); onRetry?.(); load(); }}>
            <Icon icon={RefreshCw} size="xs" /> Coba lagi
          </button>
        </div>
        <div className="pasv-wallet__body">
          <EmptyState icon={WifiOff} title="Mode Offline" description="Data dompet akan dimuat saat koneksi kembali." />
        </div>
      </div>
    );
  }

  const openPick = () => {
    const m = methods && methods.length ? methods[0] : null;
    setPicked({ method: m, voucher: null });
    setSheetOpen(true);
  };

  return (
    <div className="pasv-wallet">
      <WalletHeader
        title="Dompet"
        action={(
          <div className="pasv-wallet__head-actions">
            <button type="button" className="pasv-ico-btn" aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} aria-pressed={dark} onClick={toggleTheme}>
              <Icon icon={dark ? Sun : Moon} size="sm" />
            </button>
            <button type="button" className="pasv-ico-btn" aria-label="Segarkan saldo" aria-busy={refreshing} onClick={refresh}>
              <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
            </button>
          </div>
        )}
      />

      {offline && (
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden />
          <span className="pasv-conn__msg">Koneksi terputus. Menampilkan data terakhir.</span>
        </div>
      )}

      <main className="pasv-wallet__body" ref={containerRef} aria-busy={refreshing}>
        {pullDistance > 0 && (
          <div className="pasv-ptr" style={{ height: pullDistance }} role="status" aria-live="polite">
            <Icon icon={RefreshCw} size="sm" className={refreshing ? 'pasv-spin' : ''} />
            <span>{refreshing ? 'Memperbarui…' : 'Tarik untuk menyegarkan'}</span>
          </div>
        )}

        {/* 1) BALANCE CARD BESAR + hide/show */}
        <section className="pasv-balance" aria-label="Saldo dompet">
          <div className="pasv-balance__top">
            <span className="pasv-balance__lbl">Saldo Tersedia</span>
            <button
              type="button"
              className="pasv-balance__eye"
              aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              aria-pressed={hidden}
              onClick={() => setHidden((h) => !h)}
            >
              <Icon icon={hidden ? EyeOff : Eye} size="sm" />
            </button>
          </div>
          <div className="pasv-balance__amt" aria-live="polite">
            {showMoney(wallet?.balance ?? 0, hidden)}
          </div>
          {wallet?.held > 0 && (
            <p className="pasv-balance__sub">Saldo tertahan: {showMoney(wallet.held, hidden)}</p>
          )}
          <div className="pasv-balance__meta">
            <span>{picked?.method ? `Metode: ${picked.method.label}` : 'Belum pilih metode'}</span>
            {updatedAt && (
              <span className="pasv-balance__upd">
                Diperbarui {updatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </section>

        {/* 2) TOP UP sebagai primary CTA + aksi cepat */}
        <section className="pasv-wallet__cta" aria-label="Aksi utama">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={Plus}
            onClick={() => onTopUp?.()}
            className="pasv-wallet__topup-cta"
          >
            Top Up
          </Button>
          <div className="pasv-wallet__quick">
            <WalletAction icon={Send} label="Transfer" onClick={() => onTransfer?.()} disabled />
            <WalletAction icon={CreditCard} label="Metode" onClick={() => onPaymentMethods?.()} />
            <WalletAction icon={History} label="Riwayat" onClick={() => onHistory?.()} />
            <WalletAction icon={Tag} label="Promo" onClick={() => onPromo?.()} />
            <WalletAction icon={ShieldCheck} label="Keamanan" onClick={() => onSecurity?.()} />
          </div>
          <button type="button" className="pasv-wallet__pick" onClick={openPick}>
            <Icon icon={WalletIcon} size="sm" />
            <span>Pilih metode &amp; voucher</span>
            <Icon icon={ChevronRight} size="xs" />
          </button>
        </section>

        {/* 3) 5 TRANSaksi TERAKHIR + View All */}
        <section className="pasv-wallet__card" aria-label="Transaksi terbaru">
          <div className="pasv-wallet__card-head">
            <span>Transaksi Terbaru</span>
            <button type="button" className="pasv-wallet__link" onClick={() => onHistory?.()}>View All</button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={History} title="Belum ada transaksi" description="Transaksi Anda akan muncul di sini." />
          ) : (
            <ul className="pasv-wallet__tx">
              {recent.map((t) => {
                const Ico = TX_ICON[t.type] || ArrowRightLeft;
                return (
                  <li key={t.id} className="pasv-wallet__tx-row">
                    <span className={`pasv-wallet__tx-ico pasv-wallet__tx-ico--${TX_TONE[t.type] || 'primary'}`}>
                      <Icon icon={Ico} size="sm" />
                    </span>
                    <span className="pasv-wallet__tx-main">
                      <span className="pasv-wallet__tx-title">{t.title}</span>
                      <span className="pasv-wallet__tx-sub">
                        {new Date(t.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {t.status}
                      </span>
                    </span>
                    <span className={`pasv-wallet__tx-amt pasv-wallet__tx-amt--${t.amount < 0 ? 'neg' : 'pos'}`}>{fmtAmt(t.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Active promotions */}
        {promos.length > 0 && (
          <section className="pasv-wallet__card" aria-label="Promo aktif">
            <div className="pasv-wallet__card-head">
              <span>Promo Aktif</span>
              <button type="button" className="pasv-wallet__link" onClick={() => onPromo?.()}>Lihat semua</button>
            </div>
            <ul className="pasv-wallet__promos">
              {promos.slice(0, 3).map((p) => (
                <li key={p.id} className="pasv-wallet__promo">
                  <span className="pasv-wallet__promo-ico"><Icon icon={Tag} size="sm" /></span>
                  <span className="pasv-wallet__promo-body">
                    <span className="pasv-wallet__promo-title">{p.title}</span>
                    <span className="pasv-wallet__promo-sub">{p.subtitle}</span>
                  </span>
                  <Badge tone={p.tone}>{p.code}</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Saved payment methods (summary) */}
        {methods && methods.length > 0 && (
          <section className="pasv-wallet__card" aria-label="Metode pembayaran tersimpan">
            <div className="pasv-wallet__card-head">
              <span>Metode Pembayaran</span>
              <button type="button" className="pasv-wallet__link" onClick={() => onPaymentMethods?.()}>Kelola</button>
            </div>
            <ul className="pasv-wallet__pms">
              {methods.slice(0, 3).map((m) => (
                <li key={m.id} className="pasv-wallet__pm">
                  <span className="pasv-wallet__pm-ico"><Icon icon={m.kind === 'card' ? CreditCard : m.kind === 'cash' ? WalletIcon : WalletIcon} size="sm" /></span>
                  <span className="pasv-wallet__pm-body">
                    <span className="pasv-wallet__pm-label">{m.label}</span>
                    <span className="pasv-wallet__pm-sub">{m.detail}</span>
                  </span>
                  {m.primary && <Badge tone="primary">Utama</Badge>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cashback summary */}
        {cashback && (
          <section className="pasv-wallet__cashback" aria-label="Ringkasan cashback">
            <span className="pasv-wallet__cashback-ico"><Icon icon={TrendingUp} size="sm" /></span>
            <div className="pasv-wallet__cashback-body">
              <span className="pasv-wallet__cashback-title">Total Cashback</span>
              <span className="pasv-wallet__cashback-amt">{money(cashback.totalCashback)}</span>
            </div>
            <div className="pasv-wallet__cashback-meta">
              <span>Bulan ini {money(cashback.thisMonth)}</span>
              <span>Tier {cashback.tier}</span>
            </div>
          </section>
        )}
      </main>

      {/* 4) BOTTOM SHEET: metode pembayaran + voucher */}
      <PaymentVoucherSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        amount={wallet?.balance ?? 0}
        selectedMethodId={picked?.method?.id}
        selectedVoucherId={picked?.voucher?.id}
        onConfirm={(sel) => { setPicked(sel); setSheetOpen(false); onPickPayment?.(sel); }}
        onManageMethods={() => { setSheetOpen(false); onPaymentMethods?.(); }}
        onViewVouchers={() => { setSheetOpen(false); onPromo?.(); }}
      />
    </div>
  );
}

function WalletHeader({ title, action }) {
  return (
    <header className="pasv-wallet__bar">
      <h1 className="pasv-wallet__title">{title}</h1>
      {action}
    </header>
  );
}

function WalletAction({ icon: Ico, label, onClick, disabled }) {
  return (
    <button type="button" className="pasv-wallet__action" onClick={onClick} disabled={disabled} aria-label={label}>
      <span className="pasv-wallet__action-ico"><Icon icon={Ico} size="md" /></span>
      <span className="pasv-wallet__action-lbl">{label}</span>
    </button>
  );
}

export default React.memo(WalletHome);
