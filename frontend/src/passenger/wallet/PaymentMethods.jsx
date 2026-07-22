import React, { useEffect, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Dialog,
} from '../../design-system/index.js';
import {
  CreditCard, Wallet, Banknote, Landmark, Plus, Check, Star, Trash2,
  ChevronLeft, WifiOff, RefreshCw, X,
} from 'lucide-react';
import * as papi from '../api.js';
import './wallet.css';

const KIND = {
  card: { label: 'Kartu Tersimpan', icon: CreditCard, group: 'cards' },
  wallet: { label: 'Dompet', icon: Wallet, group: 'wallet' },
  cash: { label: 'Tunai', icon: Banknote, group: 'cash' },
  bank: { label: 'Rekening Bank', icon: Landmark, group: 'bank' },
};
const GROUP_ORDER = [
  { key: 'cards', label: 'Kartu Tersimpan' },
  { key: 'wallet', label: 'Dompet' },
  { key: 'cash', label: 'Tunai' },
  { key: 'bank', label: 'Rekening Bank' },
];

/**
 * PaymentMethods (4D) — manage passenger payment methods. REUSES:
 *   - api.getPaymentMethods / addPaymentMethod / removePaymentMethod /
 *     setDefaultPaymentMethod (sample, client-mutated; one source of truth)
 *   - design-system Button / Icon / Badge / Skeleton / EmptyState / ErrorState / Dialog
 *   - Payment module concepts (kind/label from PaymentSelection)
 *
 * Features: grouped list (Cards / Wallet / Cash / Bank), default-method
 * indicator + set default, add method (dialog), remove (confirm dialog),
 * loading / empty / offline / error states. No payment backend.
 */
export default function PaymentMethods({ onBack, onAdd, onChanged, onNext }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null); // method object or null

  const load = async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const m = await papi.getPaymentMethods();
      setMethods(m);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [offline]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const grouped = GROUP_ORDER.map((g) => ({
    ...g,
    items: methods.filter((m) => (KIND[m.kind]?.group || 'cards') === g.key),
  })).filter((g) => g.items.length > 0);

  const makeDefault = async (m) => {
    setBusy(true);
    try { await papi.setDefaultPaymentMethod(m.id); await load(); onChanged?.(); }
    finally { setBusy(false); }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setBusy(true);
    try { await papi.removePaymentMethod(removing.id); setRemoving(null); await load(); onChanged?.(); }
    finally { setBusy(false); }
  };

  // ---- States ----
  if (loading) {
    return (
      <div className="pasv-pm">
        <Bar onBack={onBack} />
        <div className="pasv-pm__body">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rect" height={64} radius="md" />)}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="pasv-pm">
        <Bar onBack={onBack} />
        <div className="pasv-pm__body"><ErrorState title="Gagal memuat metode" description="Terjadi kesalahan." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} /></div>
      </div>
    );
  }
  if (offline) {
    return (
      <div className="pasv-pm">
        <Bar onBack={onBack} />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden /><span className="pasv-conn__msg">Koneksi terputus.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); load(); }}><Icon icon={RefreshCw} size="xs" /> Coba lagi</button>
        </div>
        <div className="pasv-pm__body"><EmptyState icon={WifiOff} title="Mode Offline" description="Metode pembayaran akan dimuat saat koneksi kembali." /></div>
      </div>
    );
  }

  return (
    <div className="pasv-pm">
      <Bar onBack={onBack} />
      <div className="pasv-pm__body">
        {methods.length === 0 ? (
          <EmptyState icon={CreditCard} title="Belum ada metode" description="Tambahkan kartu, dompet, atau rekening bank." />
        ) : (
          grouped.map((g) => (
            <section key={g.key} className="pasv-pm__group" aria-label={g.label}>
              <h2 className="pasv-pm__group-lbl">{g.label}</h2>
              <ul className="pasv-pm__ul">
                {g.items.map((m) => {
                  const Ico = KIND[m.kind]?.icon || CreditCard;
                  return (
                    <li key={m.id} className={`pasv-pm__row ${m.primary ? 'is-default' : ''}`}>
                      <span className="pasv-pm__row-ico"><Icon icon={Ico} size="sm" /></span>
                      <span className="pasv-pm__row-body">
                        <span className="pasv-pm__row-label">{m.label}</span>
                        <span className="pasv-pm__row-sub">{m.detail}{m.expires ? ` · ${m.expires}` : ''}</span>
                      </span>
                      {m.primary ? <Badge tone="primary"><Star size={12} /> Utama</Badge> : (
                        <button type="button" className="pasv-pm__default" aria-label={`Jadikan utama ${m.label}`} disabled={busy} onClick={() => makeDefault(m)}>Jadikan utama</button>
                      )}
                      {!m.primary && m.kind !== 'wallet' && (
                        <button type="button" className="pasv-pm__remove" aria-label={`Hapus ${m.label}`} disabled={busy} onClick={() => setRemoving(m)}><Icon icon={Trash2} size="sm" /></button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
        <Button variant="primary" className="pasv-pm__add" onClick={() => { onAdd?.(); setAdding(true); }}><Icon icon={Plus} size="sm" /> Tambah Metode</Button>
        {onNext && <Button variant="outline" className="pasv-pm__next" onClick={onNext}>Lanjut</Button>}
      </div>

      {adding && (
        <AddMethodDialog
          onClose={() => setAdding(false)}
          onAdded={async (method) => { setBusy(true); try { await papi.addPaymentMethod(method); setAdding(false); await load(); onChanged?.(); } finally { setBusy(false); } }}
        />
      )}

      {removing && (
        <Dialog open onClose={() => setRemoving(null)} title="Hapus metode" aria-label="Konfirmasi hapus metode">
          <p className="pasv-pm__confirm">Hapus <strong>{removing.label}</strong> dari metode pembayaran?</p>
          <div className="pasv-pm__confirm-actions">
            <Button variant="ghost" onClick={() => setRemoving(null)}>Batal</Button>
            <Button variant="destructive" disabled={busy} onClick={confirmRemove}>Hapus</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Bar({ onBack }) {
  return (
    <header className="pasv-pm__bar">
      <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
      <h1 className="pasv-pm__title">Metode Pembayaran</h1>
      <span className="pasv-pm__bar-spacer" />
    </header>
  );
}

function AddMethodDialog({ onClose, onAdded }) {
  const [tab, setTab] = useState('card'); // card | wallet | cash | bank
  const [label, setLabel] = useState('');
  const [number, setNumber] = useState('');
  const [expires, setExpires] = useState('');
  const [account, setAccount] = useState('');
  const [primary, setPrimary] = useState(false);

  const submit = () => {
    if (tab === 'card') {
      if (!label || !number) return;
      onAdded({ kind: 'card', label: `${label} •••• ${number.slice(-4)}`, detail: label, expires });
    } else if (tab === 'wallet') {
      onAdded({ kind: 'wallet', label: label || 'Dompet', detail: 'Saldo', primary });
    } else if (tab === 'cash') {
      onAdded({ kind: 'cash', label: 'Tunai', detail: 'Bayar di akhir' });
    } else {
      if (!label || !account) return;
      onAdded({ kind: 'bank', label: `${label} •••• ${account.slice(-4)}`, detail: label });
    }
  };

  const tabs = [
    { id: 'card', label: 'Kartu' }, { id: 'wallet', label: 'Dompet' },
    { id: 'cash', label: 'Tunai' }, { id: 'bank', label: 'Bank' },
  ];

  return (
    <Dialog open onClose={onClose} title="Tambah Metode" aria-label="Tambah metode pembayaran">
      <div className="pasv-pm__tabs" role="tablist" aria-label="Jenis metode">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`pasv-pm__tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="pasv-pm__form">
        {tab === 'card' && (
          <>
            <label className="pasv-pm__field"><span>Nama pada kartu</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Budi A." aria-label="Nama pada kartu" /></label>
            <label className="pasv-pm__field"><span>Nomor kartu</span><input value={number} onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 16))} placeholder="1234567812345678" inputMode="numeric" aria-label="Nomor kartu" /></label>
            <label className="pasv-pm__field"><span>Kadaluarsa</span><input value={expires} onChange={(e) => setExpires(e.target.value)} placeholder="MM/YY" aria-label="Kadaluarsa kartu" /></label>
          </>
        )}
        {tab === 'wallet' && (
          <label className="pasv-pm__field"><span>Nama dompet</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Dompet Ojol" aria-label="Nama dompet" /></label>
        )}
        {tab === 'cash' && <p className="pasv-pm__hint">Pembayaran tunai dilakukan di akhir perjalanan.</p>}
        {tab === 'bank' && (
          <>
            <label className="pasv-pm__field"><span>Nama bank</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="BCA" aria-label="Nama bank" /></label>
            <label className="pasv-pm__field"><span>Nomor rekening</span><input value={account} onChange={(e) => setAccount(e.target.value.replace(/[^\d]/g, '').slice(0, 20))} placeholder="1234567890" inputMode="numeric" aria-label="Nomor rekening" /></label>
          </>
        )}
      </div>
      <div className="pasv-pm__confirm-actions">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button variant="primary" onClick={submit}>Simpan</Button>
      </div>
    </Dialog>
  );
}
