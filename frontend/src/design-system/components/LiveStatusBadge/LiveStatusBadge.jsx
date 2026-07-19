import React from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * LiveStatusBadge — live/offline/busy pill with pulsing dot.
 * @param {'online'|'offline'|'busy'} status
 */
export default function LiveStatusBadge({ status = 'online', label, className, ...rest }) {
  const map = { online: { cls: '', text: label || 'Live' }, offline: { cls: 'ds-live--offline', text: label || 'Offline' }, busy: { cls: 'ds-live--busy', text: label || 'Busy' } };
  const s = map[status] || map.online;
  return (
    <span className={cx('ds-live', s.cls, className)} {...rest}>
      <span className="ds-live__dot" />
      {s.text}
    </span>
  );
}
