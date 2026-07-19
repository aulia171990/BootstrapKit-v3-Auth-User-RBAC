import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '../../design-system/index.js';
import { ArrowLeft, Phone, Send, Check, CheckCheck, Clock, MessageSquare } from 'lucide-react';
import {
  subscribe, sendMessage, simulateDriverReply, markRead, setActive, seedIfEmpty, quickReplies,
} from './chatStore.js';
import './communication.css';

/**
 * ChatScreen (3C-3E) — Passenger↔Driver chat.
 *
 * Reuses: Avatar (driver), chatStore (local, backend-free), api.getQuickReplies.
 * Implements: message bubbles, message status (sending/sent/delivered/read),
 * typing indicator, quick replies, unread badge, composer.
 *
 * No backend — driver replies are simulated (typing → message) so the full UX
 * is demonstrable and testable.
 */
export default function ChatScreen({ booking, driver, onClose, onCall }) {
  const id = booking?.id;
  const [snap, setSnap] = useState({ messages: [], unread: 0, typing: false });
  const [drafts, setDrafts] = useState([]); // quick replies
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (!id) return undefined;
    seedIfEmpty(id, driver);
    setActive(id, true);
    markRead(id);
    const off = subscribe(id, setSnap);
    let alive = true;
    quickReplies().then((q) => { if (alive) setDrafts(q); });
    return () => { alive = false; setActive(id, false); off(); };
  }, [id, driver]);

  useEffect(() => {
    // autoscroll to latest
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [snap.messages.length, snap.typing]);

  const handleSend = (value) => {
    const t = (value ?? text).trim();
    if (!t) return;
    sendMessage(id, t);
    setText('');
    simulateDriverReply(id, autoReply(t));
  };

  return (
    <div className="pasv-chat">
      <header className="pasv-chat__bar">
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onClose}><Icon icon={ArrowLeft} size="sm" /></button>
        {driver && <Avatar src={driver.photo} name={driver.name} size="sm" status="online" aria-label={`Foto driver ${driver.name}`} />}
        <div className="pasv-chat__who">
          <span className="pasv-chat__name">{driver?.name || 'Driver'}</span>
          <span className="pasv-chat__sub" aria-live="polite">{snap.typing ? ' sedang mengetik…' : driver?.vehicle || 'Online'}</span>
        </div>
        {onCall && (
          <button type="button" className="pasv-ico-btn pasv-chat__call" aria-label={`Telepon ${driver?.name || 'driver'}`} onClick={() => onCall?.(driver)}>
            <Icon icon={Phone} size="sm" />
          </button>
        )}
      </header>

      {(snap.unread > 0) && (
        <div className="pasv-chat__unread" role="status">Pesan belum dibaca: {snap.unread}</div>
      )}

      <div className="pasv-chat__list" ref={listRef} aria-live="polite">
        {snap.messages.map((m) => (
          <div key={m.id} className={`pasv-chat__row pasv-chat__row--${m.from}`}>
            <div className={`pasv-chat__bubble pasv-chat__bubble--${m.from}`}>
              <span className="pasv-chat__text">{m.text}</span>
              <span className="pasv-chat__meta">
                {fmtTime(m.ts)}
                {m.from === 'me' && <StatusTick status={m.status} />}
              </span>
            </div>
          </div>
        ))}
        {snap.typing && (
          <div className="pasv-chat__row pasv-chat__row--driver">
            <div className="pasv-chat__bubble pasv-chat__bubble--driver pasv-chat__bubble--typing" aria-label="Driver sedang mengetik">
              <span className="pasv-chat__dot" /><span className="pasv-chat__dot" /><span className="pasv-chat__dot" />
            </div>
          </div>
        )}
      </div>

      <div className="pasv-chat__quick" aria-label="Balasan cepat">
        {drafts.map((q) => (
          <button key={q} type="button" className="pasv-chat__chip" onClick={() => handleSend(q)}>{q}</button>
        ))}
      </div>

      <form className="pasv-chat__composer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <input
          className="pasv-chat__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis pesan…"
          aria-label="Tulis pesan"
        />
        <button type="submit" className="pasv-ico-btn pasv-chat__send" aria-label="Kirim" disabled={!text.trim()}>
          <Icon icon={Send} size="sm" />
        </button>
      </form>
    </div>
  );
}

function StatusTick({ status }) {
  if (status === 'sending') return <Icon icon={Clock} size="xs" className="pasv-chat__tick pasv-chat__tick--sending" />;
  if (status === 'sent') return <Icon icon={Check} size="xs" className="pasv-chat__tick" />;
  if (status === 'delivered') return <Icon icon={CheckCheck} size="xs" className="pasv-chat__tick" />;
  return <Icon icon={CheckCheck} size="xs" className="pasv-chat__tick pasv-chat__tick--read" />;
}

function fmtTime(ts) {
  try { return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}

function autoReply(text) {
  const t = text.toLowerCase();
  if (t.includes('titik jemput') || t.includes('sudah di')) return 'Baik, saya menuju titik jemput Anda.';
  if (t.includes('tunggu')) return 'Siap, saya tunggu.';
  if (t.includes('posisi') || t.includes('di mana')) return 'Saya sudah dekat, estimasi beberapa menit lagi.';
  if (t.includes('tol')) return 'Bisa, akan saya lewati jika lebih cepat.';
  return 'Oke, terima kasih.';
}
