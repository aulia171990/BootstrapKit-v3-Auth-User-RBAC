import React, { useEffect, useState } from 'react';
import {
  Button, Icon, Badge, Skeleton, EmptyState, ErrorState, Dialog,
} from '../../design-system/index.js';
import {
  ChevronLeft, RotateCcw, MessageCircle, LifeBuoy, AlertTriangle, FileText,
  Send, CheckCircle2, Clock, Phone, ShieldAlert,
} from 'lucide-react';
import { formatIDR } from '../booking/pricingEngine.js';
import * as papi from '../api.js';
import './refundSupport.css';

const REFUND_TONE = { completed: 'success', processing: 'warning', failed: 'danger' };
const REFUND_LABEL = { completed: 'Selesai', processing: 'Diproses', failed: 'Gagal' };
const TICKET_LABEL = { open: 'Dibuka', review: 'Ditinjau', resolved: 'Selesai', closed: 'Ditutup' };
const TICKET_TONE = { open: 'warning', review: 'info', resolved: 'success', closed: 'muted' };

const HELP_ARTICLES = [
  { id: 'h1', title: 'Cara membatalkan perjalanan', icon: RotateCcw },
  { id: 'h2', title: 'Kapan saya mendapat refund?', icon: RotateCcw },
  { id: 'h3', title: 'Masalah dengan pengemudi', icon: AlertTriangle },
  { id: 'h4', title: 'Sengketa tarif & promo', icon: FileText },
];

/**
 * RefundSupport (Sprint 5, 3E-5G) — Refund & Support hub.
 *
 * REUSES (no duplicated business logic):
 *   - papi.getRefunds (derived from the Payment module's wallet 'refund'
 *     transactions via getTransactions — single source of truth).
 *   - papi.getSupportTickets / createSupportTicket / submitTripDispute
 *     (API-first with demo fallback).
 *   - formatIDR (Pricing Engine).
 *   - design-system: Button / Icon / Badge / Skeleton / EmptyState / ErrorState
 *     / Dialog. Contact Support reuses the shell's chat & safety routes.
 */
export default function RefundSupport({ trip, onBack, onContactSupport, onDispute, onHelpArticle }) {
  const [refunds, setRefunds] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState(false);
  const [detail, setDetail] = useState(null); // refund object for dialog
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ subject: '', message: '', category: 'payment' });
  const [reportBusy, setReportBusy] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const load = () => {
    setError(false);
    Promise.all([
      papi.getRefunds(trip?.id),
      papi.getSupportTickets(),
    ]).then(([r, t]) => { setRefunds(r); setTickets(t); })
      .catch(() => setError(true));
  };
  useEffect(load, [trip?.id]);

  const submitReport = async () => {
    if (!report.subject.trim() || !report.message.trim() || reportBusy) return;
    setReportBusy(true);
    try {
      await papi.createSupportTicket({ tripId: trip?.id, ...report });
      setReportDone(true);
      load();
    } finally {
      setReportBusy(false);
    }
  };

  if (error) {
    return (
      <Wrap onBack={onBack}>
        <ErrorState title="Gagal memuat" description="Tidak dapat mengambil data refund & dukungan." action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />
      </Wrap>
    );
  }

  return (
    <Wrap onBack={onBack}>
      <main className="pasv-rs__body">
        {/* Quick actions */}
        <section className="pasv-rs__quick" aria-label="Aksi cepat">
          <button type="button" className="pasv-rs__quick-btn" onClick={() => onContactSupport?.(trip, 'chat')}>
            <Icon icon={MessageCircle} size="sm" /> Hubungi CS
          </button>
          <button type="button" className="pasv-rs__quick-btn" onClick={() => setReportOpen(true)}>
            <Icon icon={LifeBuoy} size="sm" /> Laporkan Masalah
          </button>
          <button type="button" className="pasv-rs__quick-btn" onClick={() => onDispute?.(trip)}>
            <Icon icon={AlertTriangle} size="sm" /> Sengketa Trip
          </button>
        </section>

        {/* Refund Status */}
        <Section icon={RotateCcw} title="Status Refund">
          {!refunds ? (
            <Skeleton variant="rect" height={120} radius="md" />
          ) : refunds.length === 0 ? (
            <p className="pasv-rs__muted">Belum ada refund untuk perjalanan ini.</p>
          ) : (
            <ul className="pasv-rs__list">
              {refunds.map((r) => (
                <li key={r.id}>
                  <button type="button" className="pasv-rs__item" onClick={() => setDetail(r)} aria-label={`Detail refund ${formatIDR(r.amount)}`}>
                    <span className="pasv-rs__item-main">
                      <span className="pasv-rs__item-title">{r.reason}</span>
                      <span className="pasv-rs__item-sub">{formatIDR(r.amount)} · {new Date(r.createdAt).toLocaleDateString('id-ID')}</span>
                    </span>
                    <Badge tone={REFUND_TONE[r.status] || 'muted'}>{REFUND_LABEL[r.status] || r.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Support Ticket Status */}
        <Section icon={FileText} title="Tiket Bantuan">
          {!tickets ? (
            <Skeleton variant="rect" height={100} radius="md" />
          ) : tickets.length === 0 ? (
            <p className="pasv-rs__muted">Belum ada tiket bantuan.</p>
          ) : (
            <ul className="pasv-rs__list">
              {tickets.map((t) => (
                <li key={t.id} className="pasv-rs__item pasv-rs__item--static">
                  <span className="pasv-rs__item-main">
                    <span className="pasv-rs__item-title">{t.subject}</span>
                    <span className="pasv-rs__item-sub">{new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                  <Badge tone={TICKET_TONE[t.status] || 'muted'}>{TICKET_LABEL[t.status] || t.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Help Center shortcut */}
        <Section icon={LifeBuoy} title="Pusat Bantuan">
          <ul className="pasv-rs__help">
            {HELP_ARTICLES.map((a) => {
              const Ico = a.icon;
              return (
                <li key={a.id}>
                  <button type="button" className="pasv-rs__help-item" onClick={() => onHelpArticle?.(a)}>
                    <Icon icon={Ico} size="sm" /> {a.title} <Icon icon={ChevronLeft} size="xs" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      </main>

      {/* Refund Detail dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} title="Detail Refund" width={420}>
        {detail && (
          <div className="pasv-rs__detail">
            <div className="pasv-rs__detail-row"><span>Jumlah</span><strong>{formatIDR(detail.amount)}</strong></div>
            <div className="pasv-rs__detail-row"><span>Alasan</span><span>{detail.reason}</span></div>
            <div className="pasv-rs__detail-row"><span>Metode</span><span>{detail.method}</span></div>
            <div className="pasv-rs__detail-row"><span>Tanggal</span><span>{new Date(detail.createdAt).toLocaleString('id-ID')}</span></div>
            <div className="pasv-rs__detail-status">
              <Badge tone={REFUND_TONE[detail.status] || 'muted'}>{REFUND_LABEL[detail.status] || detail.status}</Badge>
              {detail.status === 'completed' && <span className="pasv-rs__ok"><CheckCircle2 size="xs" /> Dana sudah kembali</span>}
              {detail.status === 'processing' && <span className="pasv-rs__warn"><Clock size="xs" /> Diproses 1–3 hari kerja</span>}
            </div>
          </div>
        )}
      </Dialog>

      {/* Report Issue dialog */}
      <Dialog open={reportOpen} onClose={() => !reportBusy && setReportOpen(false)} title="Laporkan Masalah" width={420}>
        {!reportDone ? (
          <div className="pasv-rs__form">
            <label className="pasv-rs__field">
              <span>Kategori</span>
              <select value={report.category} onChange={(e) => setReport((r) => ({ ...r, category: e.target.value }))} aria-label="Kategori">
                <option value="payment">Pembayaran & Refund</option>
                <option value="driver">Pengemudi</option>
                <option value="safety">Keamanan</option>
                <option value="app">Aplikasi</option>
              </select>
            </label>
            <label className="pasv-rs__field">
              <span>Subjek</span>
              <input type="text" value={report.subject} onChange={(e) => setReport((r) => ({ ...r, subject: e.target.value }))} placeholder="Contoh: Tarif tidak sesuai" aria-label="Subjek" />
            </label>
            <label className="pasv-rs__field">
              <span>Detail</span>
              <textarea rows={3} value={report.message} onChange={(e) => setReport((r) => ({ ...r, message: e.target.value }))} placeholder="Jelaskan masalah Anda…" aria-label="Detail" />
            </label>
            <div className="pasv-rs__dialog-actions">
              <Button variant="secondary" onClick={() => setReportOpen(false)} disabled={reportBusy}>Batal</Button>
              <Button variant="primary" onClick={submitReport} disabled={reportBusy || !report.subject.trim() || !report.message.trim()}>
                <Icon icon={Send} size="sm" /> {reportBusy ? 'Mengirim…' : 'Kirim'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="pasv-rs__sent">
            <CheckCircle2 size="md" /> Laporan terkirim. Tim kami akan menghubungi Anda.
            <div className="pasv-rs__dialog-actions">
              <Button variant="primary" onClick={() => { setReportDone(false); setReportOpen(false); setReport({ subject: '', message: '', category: 'payment' }); }}>Tutup</Button>
            </div>
          </div>
        )}
      </Dialog>
    </Wrap>
  );
}

function Wrap({ onBack, children }) {
  return (
    <div className="pasv-rs">
      <header className="pasv-rs__bar">
        {onBack && (
          <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="md" /></button>
        )}
        <h1 className="pasv-rs__title">Refund &amp; Bantuan</h1>
        <span className="pasv-rs__bar-spacer" />
      </header>
      {children}
    </div>
  );
}

function Section({ icon: Ico, title, children }) {
  return (
    <section className="pasv-rs__section" aria-label={title}>
      <div className="pasv-rs__section-head"><Icon icon={Ico} size="sm" /> {title}</div>
      {children}
    </section>
  );
}
