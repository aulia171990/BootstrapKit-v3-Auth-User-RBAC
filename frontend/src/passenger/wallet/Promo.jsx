import React, { useEffect, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Dialog,
} from '../../design-system/index.js';
import {
  Tag, ChevronLeft, WifiOff, RefreshCw, Check, X, Clock, History, Trash2, Info,
} from 'lucide-react';
import * as papi from '../api.js';
import './wallet.css';

const TONE = {
  primary: 'primary', success: 'success', warning: 'warning', danger: 'danger', neutral: 'neutral',
};

const fmtExpiry = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtValue = (p) => (p.valueType === 'percent' ? `${p.value}%` : `Rp${p.value.toLocaleString('id-ID')}`);

/**
 * Promo (4E) — Voucher list, detail, eligibility, apply/remove, history, empty, expired.
 * REUSES: api promotions module (getPromotions / getPromoDetail / getPromoHistory /
 * getAppliedPromo / applyPromo / removePromo), design-system components, WalletHome promo shape.
 */
export default function Promo({ onBack, onChanged, onNext }) {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [appliedId, setAppliedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    if (offline) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const [a, h, ap] = await Promise.all([papi.getPromotions(), papi.getPromoHistory(), papi.getAppliedPromo()]);
      setActive(a); setHistory(h); setAppliedId(ap?.id || null);
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

  const openDetail = async (p) => { setDetail(await papi.getPromoDetail(p.id)); };
  const closeDetail = () => setDetail(null);

  const apply = async (p) => {
    setBusy(true);
    try { await papi.applyPromo(p.id); setAppliedId(p.id); onChanged?.(); }
    catch { /* gated: ineligible/expired handled in UI */ }
    finally { setBusy(false); }
  };

  const remove = async (p) => {
    setBusy(true);
    try { await papi.removePromo(p.id); setAppliedId(null); onChanged?.(); }
    finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="pasv-promo">
        <Bar onBack={onBack} />
        <div className="pasv-promo__body">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rect" height={88} radius="md" />)}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="pasv-promo">
        <Bar onBack={onBack} />
        <div className="pasv-promo__body"><ErrorState title="Gagal memuat promo" description="Terjadi kesalahan." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} /></div>
      </div>
    );
  }
  if (offline) {
    return (
      <div className="pasv-promo">
        <Bar onBack={onBack} />
        <div className="pasv-conn pasv-conn--offline" role="status" aria-live="polite">
          <Icon icon={WifiOff} size="sm" aria-hidden /><span className="pasv-conn__msg">Koneksi terputus.</span>
          <button type="button" className="pasv-conn__retry" onClick={() => { setOffline(false); load(); }}><Icon icon={RefreshCw} size="xs" /> Coba lagi</button>
        </div>
        <div className="pasv-promo__body"><EmptyState icon={WifiOff} title="Mode Offline" description="Promo & voucher akan dimuat saat koneksi kembali." /></div>
      </div>
    );
  }

  const activeList = active;
  const expired = history.filter((p) => p.status === 'expired');
  const used = history.filter((p) => p.status === 'used');

  return (
    <div className="pasv-promo">
      <Bar onBack={onBack} />
      <div className="pasv-promo__body">
        {appliedId && (
          <div className="pasv-promo__applied" role="status" aria-live="polite">
            <span className="pasv-promo__applied-ico"><Check size={16} /></span>
            <span className="pasv-promo__applied-txt">Promo <strong>{active.find((p) => p.id === appliedId)?.code}</strong> diterapkan</span>
            <button type="button" className="pasv-promo__applied-remove" aria-label="Hapus promo yang diterapkan" disabled={busy} onClick={() => remove(active.find((p) => p.id === appliedId))}><X size={14} /></button>
          </div>
        )}

        {activeList.length === 0 ? (
          <EmptyState icon={Tag} title="Tidak ada promo aktif" description="Promo & voucher akan muncul di sini." />
        ) : (
          <>
            <h2 className="pasv-promo__sec">Voucher & Promo</h2>
            <ul className="pasv-promo__ul">
              {activeList.map((p) => (
                <li key={p.id} className={`pasv-promo__row ${!p.eligible ? 'is-locked' : ''} ${appliedId === p.id ? 'is-applied' : ''}`}>
                  <span className="pasv-promo__row-ico"><Icon icon={Tag} size="sm" /></span>
                  <button type="button" className="pasv-promo__row-body" aria-label={`Detail ${p.title}`} onClick={() => openDetail(p)}>
                    <span className="pasv-promo__row-title">{p.title}</span>
                    <span className="pasv-promo__row-sub">{p.subtitle}</span>
                    <span className="pasv-promo__row-meta"><Badge tone={TONE[p.tone] || 'neutral'}>{fmtValue(p)}</Badge>{!p.eligible && <Badge tone="neutral"><Info size={12} /> {p.eligibilityNote}</Badge>}</span>
                  </button>
                  {appliedId === p.id ? (
                    <button type="button" className="pasv-promo__remove" aria-label={`Hapus ${p.title}`} disabled={busy} onClick={() => remove(p)}>Hapus</button>
                  ) : (
                    <button type="button" className="pasv-promo__apply" aria-label={`Gunakan ${p.title}`} disabled={busy || !p.eligible} onClick={() => apply(p)}>{p.eligible ? 'Gunakan' : 'Tidak berhak'}</button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {expired.length > 0 && (
          <section className="pasv-promo__group" aria-label="Voucher kadaluarsa">
            <h2 className="pasv-promo__sec"><Clock size={14} /> Kadaluarsa</h2>
            <ul className="pasv-promo__ul">
              {expired.map((p) => (
                <li key={p.id} className="pasv-promo__row is-expired">
                  <span className="pasv-promo__row-ico"><Icon icon={Tag} size="sm" /></span>
                  <button type="button" className="pasv-promo__row-body" aria-label={`Detail ${p.title}`} onClick={() => openDetail(p)}>
                    <span className="pasv-promo__row-title">{p.title}</span>
                    <span className="pasv-promo__row-sub">Berakhir {fmtExpiry(p.expiry)}</span>
                  </button>
                  <Badge tone="neutral">Kadaluarsa</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {used.length > 0 && (
          <section className="pasv-promo__group" aria-label="Riwayat promo">
            <h2 className="pasv-promo__sec"><History size={14} /> Riwayat</h2>
            <ul className="pasv-promo__ul">
              {used.map((p) => (
                <li key={p.id} className="pasv-promo__row is-used">
                  <span className="pasv-promo__row-ico"><Icon icon={Tag} size="sm" /></span>
                  <button type="button" className="pasv-promo__row-body" aria-label={`Detail ${p.title}`} onClick={() => openDetail(p)}>
                    <span className="pasv-promo__row-title">{p.title}</span>
                    <span className="pasv-promo__row-sub">Digunakan {fmtExpiry(p.usedAt)}</span>
                  </button>
                  <Badge tone="success">Terpakai</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
        {onNext && <Button variant="outline" className="pasv-promo__next" onClick={onNext}>Lanjut</Button>}
      </div>

      {detail && (
        <Dialog open onClose={closeDetail} title={detail.title} aria-label={`Detail promo ${detail.title}`}>
          <div className="pasv-promo__detail">
            <div className="pasv-promo__detail-code">
              <span>Kode</span><code>{detail.code}</code>
            </div>
            <p className="pasv-promo__detail-desc">{detail.description}</p>
            <dl className="pasv-promo__detail-dl">
              <div><dt>Jenis</dt><dd>{detail.kind}</dd></div>
              <div><dt>Nilai</dt><dd>{fmtValue(detail)}</dd></div>
              <div><dt>Min. belanja</dt><dd>{detail.minSpend ? `Rp${detail.minSpend.toLocaleString('id-ID')}` : '—'}</dd></div>
              <div><dt>Berlaku hingga</dt><dd>{fmtExpiry(detail.expiry)}</dd></div>
              <div><dt>Status</dt><dd>{detail.status === 'active' ? 'Aktif' : detail.status === 'expired' ? 'Kadaluarsa' : 'Terpakai'}</dd></div>
              <div><dt>Eligibilitas</dt><dd>{detail.eligible ? <Badge tone="success">Anda berhak</Badge> : <Badge tone="neutral">{detail.eligibilityNote}</Badge>}</dd></div>
            </dl>
            <p className="pasv-promo__detail-terms"><strong>Syarat & Ketentuan:</strong> {detail.terms}</p>
          </div>
          <div className="pasv-promo__detail-actions">
            {detail.status === 'active' && (
              appliedId === detail.id ? (
                <Button variant="outline" disabled={busy} onClick={() => remove(detail)}>Hapus Promo</Button>
              ) : (
                <Button variant="primary" disabled={busy || !detail.eligible} onClick={() => apply(detail)}>{detail.eligible ? 'Gunakan Promo' : 'Tidak Memenuhi Syarat'}</Button>
              )
            )}
            <Button variant="ghost" onClick={closeDetail}>Tutup</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Bar({ onBack }) {
  return (
    <header className="pasv-promo__bar">
      <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="sm" /></button>
      <h1 className="pasv-promo__title">Promo & Voucher</h1>
      <span className="pasv-promo__bar-spacer" />
    </header>
  );
}
