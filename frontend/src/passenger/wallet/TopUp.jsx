import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Badge, Skeleton } from '../../design-system/index.js';
import {
  Wallet, Plus, Building2, CreditCard, Landmark, QrCode, ChevronLeft, Check,
  Copy, Download, CheckCircle2, Clock, X, ArrowLeftRight,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import './wallet.css';

const PRESETS = [20000, 50000, 100000, 200000, 500000];
const CHANNEL_ICON = { va: Building2, card: CreditCard, bank: Landmark, qr: QrCode, wallet: Wallet };

/**
 * TopUp (4C) — Passenger Wallet top-up flow. REUSES the Payment module's
 * channel concepts + the shared Pricing Engine's formatIDR; calls the sample
 * top-up API (no payment backend — createTopUp/confirmTopUp simulate a flow).
 *
 * Flow: amount (preset + custom) → channel selection (VA / Credit Card /
 * Bank Transfer / QR / Wallet) → confirmation → status (pending, with
 * virtual account / QR placeholder) → receipt. States: loading / error.
 */
export default function TopUp({ onBack, onDone, onExportReceipt, prefill }) {
  const [step, setStep] = useState('amount'); // amount | channel | confirm | status | receipt
  const [amount, setAmount] = useState(null);
  const [custom, setCustom] = useState('');
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState(prefill?.method?.id ? prefill.method : null);
  const [voucher, setVoucher] = useState(prefill?.voucher || null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    papi.getTopUpChannels().then(setChannels).catch(() => setChannels([]));
  }, []);

  const effectiveAmount = amount || (Number(custom) || 0);
  const canContinue = effectiveAmount >= 10000;

  const chooseAmount = (v) => { setAmount(v); setCustom(''); };
  const chooseCustom = (v) => { setCustom(v); setAmount(null); };

  const startTopUp = async () => {
    setBusy(true); setError(null);
    try {
      const o = await papi.createTopUp({ amount: effectiveAmount, channel });
      setOrder(o);
      setStep('status');
    } catch (e) {
      setError('Gagal membuat permintaan top up.');
    } finally { setBusy(false); }
  };

  const confirmNow = async () => {
    setBusy(true); setError(null);
    try {
      const confirmed = await papi.confirmTopUp(order.id);
      setOrder({ ...order, ...confirmed });
      if (confirmed.status === 'completed') setStep('receipt');
    } catch { setError('Gagal mengonfirmasi pembayaran.'); }
    finally { setBusy(false); }
  };

  const exportReceipt = () => {
    onExportReceipt?.(order);
    try {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const text = buildReceipt(order);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `topup-${order.id}.txt`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      }
    } catch { /* unsupported */ }
  };

  const copyVA = () => { if (order?.virtualAccount) navigator.clipboard?.writeText(order.virtualAccount).catch(() => {}); };

  return (
    <div className="pasv-topup">
      <Bar title={
        step === 'amount' ? 'Top Up' :
        step === 'channel' ? 'Pilih Metode' :
        step === 'confirm' ? 'Konfirmasi' :
        step === 'status' ? 'Status Top Up' : 'Struk Top Up'
      } onBack={() => step === 'amount' ? onBack?.() : setStep(step === 'receipt' ? 'status' : step === 'status' ? 'confirm' : step === 'confirm' ? 'channel' : 'amount')} />

      {step === 'amount' && (
        <main className="pasv-topup__body">
          <label className="pasv-topup__amount-label" htmlFor="topup-custom">Nominal Top Up</label>
          <div className="pasv-topup__amount-box">
            <span className="pasv-topup__amount-prefix">Rp</span>
            <input id="topup-custom" className="pasv-topup__amount-input" inputMode="numeric" placeholder="0"
              value={custom || (amount ? String(amount) : '')} onChange={(e) => chooseCustom(e.target.value.replace(/[^\d]/g, ''))} aria-label="Nominal top up" />
          </div>
          <div className="pasv-topup__presets">
            {PRESETS.map((p) => (
              <button key={p} type="button" className={`pasv-topup__preset ${amount === p ? 'is-active' : ''}`} onClick={() => chooseAmount(p)} aria-pressed={amount === p}>
                {formatIDR(p)}
              </button>
            ))}
          </div>
          {!canContinue && <p className="pasv-topup__hint">Minimal top up Rp 10.000</p>}
          <Button variant="primary" className="pasv-topup__next" disabled={!canContinue} onClick={() => setStep('channel')}>Lanjut</Button>
        </main>
      )}

      {step === 'channel' && (
        <main className="pasv-topup__body">
          <section className="pasv-topup__section" aria-label="Metode pembayaran">
            <div className="pasv-topup__chans" role="radiogroup" aria-label="Pilih metode">
              {channels.map((c) => {
                const Ico = CHANNEL_ICON[c.kind] || Wallet;
                const active = channel?.id === c.id;
                return (
                  <button key={c.id} type="button" role="radio" aria-checked={active}
                    className={`pasv-topup__chan ${active ? 'is-active' : ''}`} onClick={() => setChannel(c)}>
                    <span className="pasv-topup__chan-ico"><Icon icon={Ico} size="sm" /></span>
                    <span className="pasv-topup__chan-body">
                      <span className="pasv-topup__chan-label">{c.label}</span>
                      <span className="pasv-topup__chan-sub">{c.detail}</span>
                    </span>
                    {active && <Icon icon={Check} size="sm" />}
                  </button>
                );
              })}
            </div>
          </section>
          <Button variant="primary" className="pasv-topup__next" disabled={!channel || busy} onClick={() => setStep('confirm')}>Lanjut</Button>
        </main>
      )}

      {step === 'confirm' && (
        <main className="pasv-topup__body">
          <div className="pasv-topup__confirm-card">
            <div className="pasv-topup__confirm-amt">{formatIDR(effectiveAmount)}</div>
            <div className="pasv-topup__confirm-row"><span>Metode</span><span>{channel?.label}</span></div>
            <div className="pasv-topup__confirm-row"><span>Voucher</span><span>{voucher ? `${voucher.code} · ${voucher.title}` : '—'}</span></div>
            <div className="pasv-topup__confirm-row"><span>Biaya admin</span><span>Rp 0</span></div>
            <div className="pasv-topup__confirm-total"><span>Total</span><span>{formatIDR(effectiveAmount)}</span></div>
          </div>
          {error && <p className="pasv-topup__err" role="alert">{error}</p>}
          <Button variant="primary" className="pasv-topup__next" disabled={busy} onClick={startTopUp}>
            {busy ? 'Memproses…' : 'Bayar Sekarang'}
          </Button>
        </main>
      )}

      {step === 'status' && order && (
        <main className="pasv-topup__body pasv-topup__status">
          {order.status === 'pending' ? (
            <>
              <div className="pasv-topup__status-ico" aria-hidden><Clock size={40} /></div>
              <h2 className="pasv-topup__status-title">Menunggu Pembayaran</h2>
              <p className="pasv-topup__status-sub">Selesaikan pembayaran melalui {order.channelLabel}.</p>
              {order.virtualAccount && (
                <div className="pasv-topup__va">
                  <div className="pasv-topup__va-label">Virtual Account</div>
                  <div className="pasv-topup__va-no">
                    <span>{order.virtualAccount}</span>
                    <button type="button" className="pasv-topup__va-copy" aria-label="Salin nomor VA" onClick={copyVA}><Icon icon={Copy} size="xs" /></button>
                  </div>
                </div>
              )}
              {order.channelKind === 'qr' && (
                <div className="pasv-topup__qr" data-testid="qr-placeholder" aria-label="QRIS placeholder"><QrCode size={140} /></div>
              )}
              <p className="pasv-topup__status-exp">Berlaku hingga {new Date(order.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              <Button variant="primary" className="pasv-topup__next" disabled={busy} onClick={confirmNow}>
                {busy ? 'Mengonfirmasi…' : 'Saya Sudah Bayar'}
              </Button>
            </>
          ) : (
            <ResultState order={order} onNext={() => setStep('receipt')} />
          )}
        </main>
      )}

      {step === 'receipt' && order && (
        <main className="pasv-topup__body">
          <div className="pasv-topup__receipt">
            <div className="pasv-topup__receipt-ico" aria-hidden><CheckCircle2 size={44} /></div>
            <h2 className="pasv-topup__receipt-title">Top Up Berhasil</h2>
            <p className="pasv-topup__receipt-amt">{formatIDR(order.amount)}</p>
            <dl className="pasv-topup__receipt-dl">
              <div><dt>ID</dt><dd>{order.id}</dd></div>
              <div><dt>Metode</dt><dd>{order.channelLabel}</dd></div>
              <div><dt>Status</dt><dd><Badge tone="success">Selesai</Badge></dd></div>
              <div><dt>Waktu</dt><dd>{new Date(order.createdAt).toLocaleString('id-ID')}</dd></div>
            </dl>
            <Button variant="secondary" onClick={exportReceipt}><Icon icon={Download} size="sm" /> Ekspor Struk</Button>
            <Button variant="primary" className="pasv-topup__next" onClick={() => onDone?.()}>Selesai</Button>
          </div>
        </main>
      )}
    </div>
  );
}

function Bar({ title, onBack }) {
  return (
    <header className="pasv-topup__bar">
      <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
      <h1 className="pasv-topup__title">{title}</h1>
      <span className="pasv-topup__bar-spacer" />
    </header>
  );
}

function ResultState({ order, onNext }) {
  return (
    <>
      <div className="pasv-topup__status-ico pasv-topup__status-ico--ok" aria-hidden><CheckCircle2 size={40} /></div>
      <h2 className="pasv-topup__status-title">Pembayaran Berhasil</h2>
      <p className="pasv-topup__status-sub">{formatIDR(order.amount)} ditambahkan ke saldo.</p>
      <Button variant="primary" className="pasv-topup__next" onClick={onNext}>Lihat Struk</Button>
    </>
  );
}

function buildReceipt(o) {
  return [
    'OJOL — Struk Top Up',
    '------------------------',
    `ID      : ${o.id}`,
    `Metode  : ${o.channelLabel}`,
    `Jumlah  : ${formatIDR(o.amount)}`,
    `Status  : ${o.status === 'completed' ? 'Selesai' : 'Tertunda'}`,
    `Waktu   : ${new Date(o.createdAt).toLocaleString('id-ID')}`,
  ].join('\n');
}
