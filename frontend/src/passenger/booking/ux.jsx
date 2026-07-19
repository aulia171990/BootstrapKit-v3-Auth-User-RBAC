import React, { useEffect, useState } from 'react';
import { Button, Icon, Skeleton } from '../../design-system/index.js';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import './ux.css';

/**
 * Shared UX primitives for the passenger booking flow (3B-2H).
 * Reusable across 3B-2A..2G so loading/offline/retry behaviour is consistent.
 */

/** Track browser online/offline status (SSR-safe). */
export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

/** Offline banner with retry. Sits at the top of a booking screen. */
export function OfflineBanner({ onRetry }) {
  return (
    <div className="pasv-offline" role="alert" aria-live="assertive">
      <Icon icon={WifiOff} size="sm" />
      <span className="pasv-offline__text">Anda sedang offline. Beberapa fitur mungkin terbatas.</span>
      {onRetry && (
        <Button variant="outline" size="sm" className="pasv-offline__retry" onClick={onRetry}>
          <Icon icon={RefreshCw} size="xs" /> Coba lagi
        </Button>
      )}
    </div>
  );
}

/** Standalone retry affordance for error states. */
export function RetryButton({ onRetry, label = 'Coba lagi' }) {
  return (
    <Button variant="primary" onClick={onRetry}>
      <Icon icon={RefreshCw} size="sm" /> {label}
    </Button>
  );
}

/** Skeleton placeholder for the vehicle list (3B-2C). */
export function VehicleListSkeleton({ count = 3 }) {
  return (
    <div className="pasv-veh__list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pasv-veh pasv-veh--skeleton">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="pasv-veh__sk-body">
            <Skeleton variant="text" lines={2} />
          </div>
          <Skeleton variant="text" width={64} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton placeholder for a fare/summary panel (3B-2D/2E/2F). */
export function FareSkeleton() {
  return (
    <div className="pasv-fare__sk" aria-hidden="true">
      <Skeleton variant="text" lines={5} />
      <Skeleton variant="text" width="50%" />
    </div>
  );
}

/** Generic inline error with retry, used when a section fails but the screen stays. */
export function InlineError({ message, onRetry }) {
  return (
    <div className="pasv-inline-err" role="alert">
      <Icon icon={AlertTriangle} size="sm" />
      <span>{message}</span>
      {onRetry && <RetryButton onRetry={onRetry} />}
    </div>
  );
}
