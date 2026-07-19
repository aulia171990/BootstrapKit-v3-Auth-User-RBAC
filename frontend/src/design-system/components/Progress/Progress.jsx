import React from 'react';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

/**
 * Progress — determinate bar.
 * @param {number} value 0..100 (or within min/max)
 * @param {number} min @param {number} max
 * @param {boolean} showLabel render value%
 * @param {'primary'|'success'|'warning'|'danger'} tone
 */
export default function Progress({ value = 0, min = 0, max = 100, showLabel = false, tone = 'primary', label, className, ...rest }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className={cx('ds-progress', className)} data-tone={tone} {...rest}>
      {(showLabel || label) && (
        <div className="ds-progress__label">
          <span>{label}</span>
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="ds-progress__track" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max}>
        <div className="ds-progress__bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
