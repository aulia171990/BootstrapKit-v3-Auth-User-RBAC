import React from 'react';
import { WifiOff, Wifi, RefreshCw, CloudOff, Database } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';
import './OfflineBanner.css';

export default function OfflineBanner({
  status = 'offline',
  label,
  description,
  onRetry,
  dismissible = false,
  onDismiss,
  className,
  ...rest
}) {
  if (status === 'online') return null;

  const config = {
    offline: {
      icon: WifiOff,
      tone: 'warning',
      defaultLabel: 'Tidak ada koneksi internet',
      defaultDesc: 'Beberapa fitur mungkin tidak tersedia',
    },
    reconnecting: {
      icon: RefreshCw,
      tone: 'info',
      defaultLabel: 'Menyambung kembali...',
      defaultDesc: 'Mencoba menyambung ke server',
    },
    retryQueue: {
      icon: CloudOff,
      tone: 'warning',
      defaultLabel: 'Antrian ulang',
      defaultDesc: 'Operasi tertunda ketika offline',
    },
    cached: {
      icon: Database,
      tone: 'info',
      defaultLabel: 'Data tersimpan',
      defaultDesc: 'Menampilkan data dari cache lokal',
    },
    syncing: {
      icon: RefreshCw,
      tone: 'info',
      defaultLabel: 'Menyinkronkan...',
      defaultDesc: 'Memperbarui data dari server',
    },
  };

  const c = config[status] || config.offline;

  return (
    <div
      className={cx('ds-offline-banner', `ds-offline-banner--${status}`, className)}
      data-tone={c.tone}
      role="status"
      aria-live="polite"
      {...rest}
    >
      <span className="ds-offline-banner__icon">
        <Icon icon={c.icon} size="sm" className={status === 'reconnecting' || status === 'syncing' ? 'ds-offline-banner__spin' : ''} />
      </span>
      <div className="ds-offline-banner__content">
        <div className="ds-offline-banner__label">{label || c.defaultLabel}</div>
        {description !== false && <div className="ds-offline-banner__desc">{description ?? c.defaultDesc}</div>}
      </div>
      {onRetry && (
        <button type="button" className="ds-offline-banner__action" onClick={onRetry} aria-label="Coba lagi">
          <RefreshCw size={14} />
        </button>
      )}
      {dismissible && onDismiss && (
        <button type="button" className="ds-offline-banner__close" onClick={onDismiss} aria-label="Tutup">
          &times;
        </button>
      )}
    </div>
  );
}
