import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * ChartLegend — themed legend for recharts <Legend content={...} />.
 * Consumes recharts' payload; lib-agnostic rendering.
 */
export default function ChartLegend({ payload = [], className }) {
  if (!payload.length) return null;
  return (
    <ul className={cx('ds-chart-legend', className)}>
      {payload.map((entry, i) => (
        <li key={i} className="ds-chart-legend__item">
          <span className="ds-chart-legend__swatch" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}
