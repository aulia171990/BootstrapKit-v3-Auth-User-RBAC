import React from 'react';
import { cx, TONE_VAR } from '../_util.js';
import './Avatar.css';

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };

/**
 * Avatar — image with initials fallback, status badge + online indicator.
 * @param {string} src image url (falls back to initials when absent/errored)
 * @param {string} name used for initials + aria-label
 * @param {('xs'|'sm'|'md'|'lg'|'xl'|number)} size
 * @param {('primary'|'secondary')} tone fallback bg
 * @param {('online'|'offline'|'busy'|'away'|'none')} status bottom-right indicator
 * @param {ReactNode} badge top-right overlay (e.g. <Badge/>)
 */
export default function Avatar({ src, name, size = 'md', tone = 'primary', rounded = 'full', status = 'none', badge, className, ...rest }) {
  const initials = (name || '')
    .split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const px = typeof size === 'number' ? size : SIZES[size] || 40;
  const statusTone = { online: 'var(--ds-color-success)', busy: 'var(--ds-color-danger)', away: 'var(--ds-color-warning)', offline: 'var(--ds-color-text-muted)' }[status];
  return (
    <span
      className={cx('ds-avatar', className)}
      style={{
        width: px, height: px,
        borderRadius: rounded === 'full' ? 'var(--ds-radius-full)' : `var(--ds-radius-${rounded})`,
        background: TONE_VAR[tone], fontSize: px * 0.4,
      }}
      aria-label={name ? `Avatar of ${name}` : undefined}
      {...rest}
    >
      {src ? <img src={src} alt={name || ''} className="ds-avatar__img" /> : initials}
      {status !== 'none' && (
        <span className="ds-avatar__status" style={{ background: statusTone }} aria-hidden="true" />
      )}
      {badge && <span className="ds-avatar__badge">{badge}</span>}
    </span>
  );
}
