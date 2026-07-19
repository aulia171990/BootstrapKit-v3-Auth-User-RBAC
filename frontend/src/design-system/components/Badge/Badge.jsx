import React from 'react';
import { cx, TONE_VAR } from '../_util.js';
import './Badge.css';

/**
 * Badge — status pill with optional dot.
 * @param {string} tone semantic color (primary/success/warning/danger/info/neutral)
 * @param {boolean} dot show leading status dot
 */
export default function Badge({ children, tone = 'neutral', dot = false, className, ...rest }) {
  return (
    <span
      className={cx('ds-badge', `ds-badge--${tone}`, className)}
      style={{ '--ds-badge-color': TONE_VAR[tone] || 'var(--ds-color-text-muted)' }}
      {...rest}
    >
      {dot && <span className="ds-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
