import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '../../design-system/index.js';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import './communication.css';

/**
 * VoiceCall (3C-3E) — passenger↔driver voice call interface.
 *
 * Reuses: Avatar (driver). No backend — call states (calling → connected →
 * ended) are simulated locally. Mute / speaker toggles update local UI only.
 */
export default function VoiceCall({ booking, driver, onClose }) {
  const [state, setState] = useState('calling'); // calling | connected | ended
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [secs, setSecs] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    // simulate the driver picking up after 2s
    const connect = setTimeout(() => setState('connected'), 2000);
    return () => clearTimeout(connect);
  }, []);

  useEffect(() => {
    if (state !== 'connected') return undefined;
    timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [state]);

  const end = () => {
    setState('ended');
    clearInterval(timer.current);
    setTimeout(() => onClose?.(), 600);
  };

  return (
    <div className="pasv-call" role="dialog" aria-modal="true" aria-label={`Panggilan suara dengan ${driver?.name || 'driver'}`}>
      <div className="pasv-call__avatar">
        {driver && <Avatar src={driver.photo} name={driver.name} size="xl" status="online" aria-label={`Foto driver ${driver.name}`} />}
      </div>
      <div className="pasv-call__name">{driver?.name || 'Driver'}</div>
      <div className="pasv-call__status" aria-live="polite">
        {state === 'calling' && 'Memanggil…'}
        {state === 'connected' && fmtCall(secs)}
        {state === 'ended' && 'Panggilan diakhiri'}
      </div>

      <div className="pasv-call__controls">
        <button
          type="button"
          className={`pasv-call__btn ${muted ? 'is-on' : ''}`}
          aria-label={muted ? 'Aktifkan mikrofon' : 'Bisukan mikrofon'}
          aria-pressed={muted}
          onClick={() => setMuted((m) => !m)}
        >
          <Icon icon={muted ? MicOff : Mic} size="md" />
        </button>
        <button
          type="button"
          className={`pasv-call__btn ${speaker ? 'is-on' : ''}`}
          aria-label={speaker ? 'Matikan speaker' : 'Aktifkan speaker'}
          aria-pressed={speaker}
          onClick={() => setSpeaker((s) => !s)}
        >
          <Icon icon={Volume2} size="md" />
        </button>
        <button type="button" className="pasv-call__btn pasv-call__btn--end" aria-label="Akhiri panggilan" onClick={end}>
          <Icon icon={PhoneOff} size="md" />
        </button>
      </div>
    </div>
  );
}

function fmtCall(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
