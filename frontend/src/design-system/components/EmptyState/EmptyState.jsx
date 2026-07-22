import React from 'react';
import { Inbox, AlertTriangle, SearchX, WifiOff, Lock, FileQuestion, ShieldOff, ServerCrash } from 'lucide-react';
import Icon from '../Icon/index.js';
import Button from '../Button/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

const VARIANT_ICONS = {
  empty: Inbox,
  noResult: SearchX,
  noInternet: WifiOff,
  permissionDenied: Lock,
  notFound: FileQuestion,
  forbidden: ShieldOff,
  serverError: ServerCrash,
};

const VARIANT_TITLES = {
  empty: 'Nothing here yet',
  noResult: 'No results found',
  noInternet: 'No internet connection',
  permissionDenied: 'Permission denied',
  notFound: 'Page not found',
  forbidden: 'Access denied',
  serverError: 'Server error',
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'empty',
  illustration,
  className,
  ...rest
}) {
  const resolvedIcon = icon ?? VARIANT_ICONS[variant] ?? Inbox;
  const resolvedTitle = title ?? VARIANT_TITLES[variant];

  return (
    <div className={cx('ds-state', className)} data-tone={variant === 'error' || variant === 'serverError' ? 'error' : 'empty'} {...rest}>
      {illustration ? (
        <div className="ds-state__illustration">{illustration}</div>
      ) : (
        <span className="ds-state__icon"><Icon icon={resolvedIcon} size="xl" /></span>
      )}
      <h3 className="ds-state__title">{resolvedTitle}</h3>
      {description && <p className="ds-state__desc">{description}</p>}
      {action && <div className="ds-state__actions">{action}</div>}
    </div>
  );
}
