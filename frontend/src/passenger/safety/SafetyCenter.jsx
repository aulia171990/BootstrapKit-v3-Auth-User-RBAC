import React, { useEffect, useState } from 'react';
import { Button, Icon, Avatar, Dialog } from '../../design-system/index.js';
import { ShieldAlert, Phone, Share2, KeyRound, Lightbulb, UserPlus, Siren, CheckCircle2, ArrowLeft } from 'lucide-react';
import * as papi from '../api.js';
import './safety.css';

/**
 * SafetyCenter (3C-3F) — Passenger trip safety.
 *
 * Reuses: Dialog (SOS confirmation modal), Button, Icon, Avatar, api samples
 * (getEmergencyContacts, addEmergencyContact, triggerSos, getVerificationCode,
 * shareTrip). No backend — all calls are sample implementations consistent with
 * the rest of the passenger app.
 *
 * Implements: SOS button + confirmation dialog, emergency contacts, share live
 * trip, trip verification code, safety tips, emergency call shortcut.
 */
const SAFETY_TIPS = [
  'Bagikan trip Anda ke keluarga sebelum berangkat.',
  'Selesaikan perjalanan di titik jemput yang ramai.',
  'Gunakan kode verifikasi untuk memastikan driver benar.',
  'Jika merasa tidak aman, tekan tombol SOS.',
  'Pantau rute secara langsung di peta.',
];

export default function SafetyCenter({ booking, driver, onClose, onSos }) {
  const [contacts, setContacts] = useState([]);
  const [code, setCode] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosBusy, setSosBusy] = useState(false);
  const [sosDone, setSosDone] = useState(false);

  useEffect(() => {
    papi.getEmergencyContacts().then(setContacts);
    papi.getVerificationCode(booking?.id).then((r) => setCode(r.code));
  }, [booking?.id]);

  const confirmSos = async () => {
    setSosBusy(true);
    try {
      await papi.triggerSos(booking?.id, { driverId: driver?.id });
      setSosDone(true);
      onSos?.(booking, driver);
    } finally {
      setSosBusy(false);
    }
  };

  const shareLive = async () => {
    const res = await papi.shareTrip(booking?.id);
    setShareUrl(res.url);
    try { await navigator.clipboard?.writeText(res.url); } catch { /* ignore */ }
  };

  const callEmergency = () => { window.location.href = 'tel:112'; };

  return (
    <div className="pasv-safety">
      <header className="pasv-safety__bar">
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onClose}><Icon icon={ArrowLeft} size="sm" /></button>
        <h1 className="pasv-safety__title">Pusat Keamanan</h1>
      </header>

      <main className="pasv-book__scroll pasv-safety__body">
        {/* SOS */}
        <section className="pasv-safety__sos">
          <button
            type="button"
            className="pasv-safety__sos-btn"
            aria-label="Kirim SOS"
            aria-haspopup="dialog"
            onClick={() => setSosOpen(true)}
          >
            <Icon icon={Siren} size="lg" />
            <span>Kirim SOS</span>
          </button>
          <p className="pasv-safety__hint">Tekan untuk menghubungi darurat jika Anda merasa tidak aman.</p>
        </section>

        {/* Emergency call shortcut */}
        <button type="button" className="pasv-safety__row" onClick={callEmergency}>
          <Icon icon={Phone} size="sm" className="pasv-safety__row-ico" />
          <span className="pasv-safety__row-main">
            <span className="pasv-safety__row-title">Panggilan Darurat</span>
            <span className="pasv-safety__row-sub">Nomor darurat nasional (112)</span>
          </span>
          <Icon icon={Phone} size="xs" />
        </button>

        {/* Share Live Trip */}
        <section className="pasv-safety__card">
          <div className="pasv-safety__card-head">
            <Icon icon={Share2} size="sm" />
            <span>Bagikan Perjalanan Live</span>
          </div>
          <Button variant="secondary" onClick={shareLive}><Icon icon={Share2} size="sm" /> Bagikan sekarang</Button>
          {shareUrl && <p className="pasv-inprogress__share" role="status">Tautan: <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></p>}
        </section>

        {/* Trip verification code */}
        <section className="pasv-safety__card">
          <div className="pasv-safety__card-head">
            <Icon icon={KeyRound} size="sm" />
            <span>Kode Verifikasi Perjalanan</span>
          </div>
          <p className="pasv-safety__code" aria-live="polite">{code ? code : '—'}</p>
          <p className="pasv-safety__hint">Beri tahu kontak tepercaya untuk memverifikasi driver Anda.</p>
        </section>

        {/* Emergency contacts */}
        <section className="pasv-safety__card">
          <div className="pasv-safety__card-head">
            <Icon icon={UserPlus} size="sm" />
            <span>Kontak Darurat</span>
          </div>
          <ul className="pasv-safety__contacts">
            {contacts.map((c) => (
              <li key={c.id} className="pasv-safety__contact">
                <Avatar name={c.name} size="sm" aria-label={`Foto ${c.name}`} />
                <span className="pasv-safety__row-main">
                  <span className="pasv-safety__row-title">{c.name}</span>
                  <span className="pasv-safety__row-sub">{c.relation} · {c.phone}</span>
                </span>
                <a className="pasv-ico-btn" href={`tel:${c.phone}`} aria-label={`Telepon ${c.name}`}><Icon icon={Phone} size="sm" /></a>
              </li>
            ))}
          </ul>
        </section>

        {/* Safety tips */}
        <section className="pasv-safety__card">
          <div className="pasv-safety__card-head">
            <Icon icon={Lightbulb} size="sm" />
            <span>Tips Keamanan</span>
          </div>
          <ul className="pasv-safety__tips">
            {SAFETY_TIPS.map((t) => (
              <li key={t}><Icon icon={CheckCircle2} size="xs" /> {t}</li>
            ))}
          </ul>
        </section>
      </main>

      {/* SOS confirmation dialog */}
      <Dialog open={sosOpen} onClose={() => !sosBusy && setSosOpen(false)} title="Kirim SOS?" width={360}>
        {!sosDone ? (
          <>
            <p>Anda akan mengirimkan alert darurat beserta lokasi dan detail perjalanan ke layanan keamanan. Lanjutkan?</p>
            <div className="pasv-safety__dialog-actions">
              <Button variant="secondary" onClick={() => setSosOpen(false)} disabled={sosBusy}>Batal</Button>
              <Button variant="danger" onClick={confirmSos} disabled={sosBusy}>
                <Icon icon={ShieldAlert} size="sm" /> {sosBusy ? 'Mengirim…' : 'Ya, Kirim SOS'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="pasv-safety__sos-ok"><Icon icon={CheckCircle2} size="sm" /> SOS terkirim. Bantuan sedang menuju.</p>
            <div className="pasv-safety__dialog-actions">
              <Button variant="primary" onClick={() => setSosOpen(false)}>Tutup</Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
