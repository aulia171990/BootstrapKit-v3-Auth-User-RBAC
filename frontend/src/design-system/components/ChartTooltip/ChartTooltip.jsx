import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * ChartTooltip — themed tooltip content for recharts <Tooltip content={...} />.
 * Compatible with recharts' active/payload/label props; lib-agnostic rendering.
 */
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cx('ds-chart-tooltip')}>
      {label != null && <div className="ds-chart-tooltip__label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="ds-chart-tooltip__row">
          <span className="ds-chart-tooltip__dot" style={{ background: p.color || p.payload?.[p.dataKey] || 'var(--ds-color-primary)' }} />
          <span>{p.name}: {formatter ? formatter(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
