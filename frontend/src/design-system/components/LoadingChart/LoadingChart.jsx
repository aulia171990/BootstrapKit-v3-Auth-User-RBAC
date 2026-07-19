import React from 'react';
import Spinner from '../Spinner/index.js';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/** LoadingChart — centered spinner placeholder for a chart area. */
export default function LoadingChart({ label = 'Loading chart…', className, ...rest }) {
  return (
    <div className={cx('ds-chart-loading', className)} role="status" aria-live="polite" {...rest}>
      <span className="ds-chart-loading__spinner"><Spinner size="lg" /></span>
      <span>{label}</span>
    </div>
  );
}
