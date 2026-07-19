import React from 'react';
import Spinner from '../Spinner/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

/**
 * Loading — centered spinner + optional label, for area/section loading.
 * @param {string} size forwarded to Spinner
 */
export default function Loading({ label, size = 'md', tone, className, ...rest }) {
  return (
    <div className={cx('ds-loading', className)} role="status" aria-live="polite" {...rest}>
      <Spinner size={size} tone={tone} />
      {label && <span className="ds-loading__label">{label}</span>}
    </div>
  );
}
