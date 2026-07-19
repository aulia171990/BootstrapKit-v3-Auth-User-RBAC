import React from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

const TONE_COLOR = {
  primary: 'var(--ds-color-primary)', secondary: 'var(--ds-color-secondary)', success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)', danger: 'var(--ds-color-danger)', info: 'var(--ds-color-info)', neutral: 'var(--ds-color-text-muted)',
};

/**
 * StatusIndicator — dot + label for a state.
 * @param {string} tone color token name
 * @param {boolean} pulse animated dot
 */
export default function StatusIndicator({ tone = 'neutral', label, pulse = false, className, ...rest }) {
  return (
    <span className={cx('ds-status', className)} {...rest}>
      <span className={cx('ds-status__dot', pulse && 'ds-status__dot--pulse')} style={{ background: TONE_COLOR[tone] || TONE_COLOR.neutral }} />
      {label && <span>{label}</span>}
    </span>
  );
}
