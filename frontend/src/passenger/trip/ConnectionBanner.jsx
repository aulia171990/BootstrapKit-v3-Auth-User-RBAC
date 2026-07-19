import React from 'react';
import { Icon, Spinner } from '../../design-system/index.js';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { CONNECTION } from './tripRealtime.js';

/**
 * ConnectionBanner (3C-3I) — shows offline / reconnecting state for the trip
 * realtime channel, with a Retry action. Uses the connection state machine in
 * tripRealtime. Hidden when online. Reuses design-system Icon + Spinner.
 */
export default function ConnectionBanner({ connection, onRetry, className = '' }) {
  if (connection === CONNECTION.ONLINE || !connection) return null;
  const offline = connection === CONNECTION.OFFLINE;
  return (
    <div
      className={`pasv-conn ${offline ? 'pasv-conn--offline' : 'pasv-conn--reconnect'} ${className}`}
      role="status"
      aria-live="polite"
    >
      {offline
        ? <Icon icon={WifiOff} size="sm" aria-hidden />
        : <Spinner size="sm" className="pasv-conn__spin" />}
      <span className="pasv-conn__msg">
        {offline ? 'Koneksi terputus. Pembaruan perjalanan dijeda.' : 'Menyambungkan kembali…'}
      </span>
      {offline && (
        <button type="button" className="pasv-conn__retry" onClick={onRetry} aria-label="Coba lagi">
          <Icon icon={RefreshCw} size="xs" /> Coba lagi
        </button>
      )}
    </div>
  );
}

export { CONNECTION };
