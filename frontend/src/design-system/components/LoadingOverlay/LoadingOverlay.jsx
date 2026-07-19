import React from 'react';
import Spinner from '../Spinner/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

/**
 * LoadingOverlay — blocking spinner over an area or the full screen.
 * @param {boolean} fullScreen fixed, covers viewport
 * @param {string} label shown under the spinner
 * @param {boolean} show keeps the overlay mounted (else renders nothing)
 */
export default function LoadingOverlay({ fullScreen = false, label, size = 'lg', className, ...rest }) {
  return (
    <div
      className={cx('ds-overlay-load', fullScreen && 'is-full', className)}
      role="status"
      aria-live="polite"
      {...rest}
    >
      <div className="ds-overlay-load__inner">
        <Spinner size={size} />
        {label && <span className="ds-overlay-load__label">{label}</span>}
      </div>
    </div>
  );
}
