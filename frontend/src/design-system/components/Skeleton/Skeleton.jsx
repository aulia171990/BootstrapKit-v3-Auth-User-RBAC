import React from 'react';
import { cx } from '../_util.js';
import './Skeleton.css';

/**
 * Skeleton — loading placeholder block(s).
 * @param {('text'|'rect'|'circle')} variant
 * @param {number} lines for 'text' variant, number of lines
 */
export default function Skeleton({
  variant = 'rect',
  width,
  height,
  radius = 'sm',
  lines = 1,
  className,
  ...rest
}) {
  if (variant === 'text' && lines > 1) {
    return (
      <span className={cx('ds-skeleton-wrap', className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="ds-skeleton ds-skeleton--text" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    );
  }
  return (
    <span
      className={cx('ds-skeleton', `ds-skeleton--${variant}`, className)}
      aria-hidden="true"
      style={{ width, height, borderRadius: variant === 'circle' ? '50%' : `var(--ds-radius-${radius})` }}
      {...rest}
    />
  );
}
