import React from 'react';
import { AlertTriangle, WifiOff, Clock, ServerCrash, RefreshCw } from 'lucide-react';
import Icon from '../Icon/index.js';
import Button from '../Button/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

const VARIANT_ICONS = {
  error: AlertTriangle,
  network: WifiOff,
  timeout: Clock,
  server: ServerCrash,
};

const VARIANT_TITLES = {
  error: 'Something went wrong',
  network: 'Connection failed',
  timeout: 'Request timed out',
  server: 'Server error',
};

const VARIANT_DESCRIPTIONS = {
  error: 'Please try again. If the problem persists, contact support.',
  network: 'Unable to connect to the server. Check your internet connection.',
  timeout: 'The request took too long. Please try again.',
  server: 'The server encountered an error. Please try again later.',
};

export default function ErrorState({
  icon,
  title,
  description,
  action,
  variant = 'error',
  onRetry,
  retryLabel = 'Try Again',
  className,
  ...rest
}) {
  const resolvedIcon = icon ?? VARIANT_ICONS[variant] ?? AlertTriangle;
  const resolvedTitle = title ?? VARIANT_TITLES[variant];
  const resolvedDesc = description ?? VARIANT_DESCRIPTIONS[variant];

  const resolvedAction = action || (onRetry ? (
    <Button variant="primary" onClick={onRetry}>
      <RefreshCw size={14} /> {retryLabel}
    </Button>
  ) : null);

  return (
    <div className={cx('ds-state', className)} data-tone="error" {...rest}>
      <span className="ds-state__icon"><Icon icon={resolvedIcon} size="xl" /></span>
      <h3 className="ds-state__title">{resolvedTitle}</h3>
      {resolvedDesc && <p className="ds-state__desc">{resolvedDesc}</p>}
      {resolvedAction && <div className="ds-state__actions">{resolvedAction}</div>}
    </div>
  );
}
