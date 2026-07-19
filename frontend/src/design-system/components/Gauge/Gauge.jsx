import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * Gauge — semicircular progress gauge (pure SVG).
 * @param {number} value 0..max
 * @param {number} max default 100
 * @param {string} tone color token name ('primary'|'success'|'warning'|'danger'|'info') or raw color
 * @param {string} label center label
 */
export default function Gauge({ value = 0, max = 100, tone = 'primary', size = 160, label, className, ...rest }) {
  const v = Math.max(0, Math.min(value, max));
  const pct = v / max;
  const r = size / 2 - 12;
  const cx0 = size / 2, cy0 = size / 2;
  const startA = Math.PI, endA = 0; // semicircle, left to right
  const a = startA + (endA - startA) * pct;
  const sx = cx0 + r * Math.cos(a), sy = cy0 + r * Math.sin(a);
  const ex = cx0 + r * Math.cos(startA), ey = cy0 + r * Math.sin(startA);
  const fx = cx0 + r * Math.cos(endA), fy = cy0 + r * Math.sin(endA);
  const color = `var(--ds-color-${tone})`;
  return (
    <div className={cx('ds-gauge', className)} style={{ width: size, height: size / 2 + 18 }} {...rest}>
      <svg width={size} height={size / 2 + 18} viewBox={`0 0 ${size} ${size / 2 + 18}`} role="img" aria-label={`${Math.round(pct * 100)}%`}>
        <path d={`M ${ex} ${ey} A ${r} ${r} 0 0 1 ${fx} ${fy}`} fill="none" stroke="var(--ds-color-border)" strokeWidth={12} strokeLinecap="round" />
        <path d={`M ${ex} ${ey} A ${r} ${r} 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" />
      </svg>
      <div className="ds-gauge__value">
        <div className="ds-gauge__num">{label ?? `${Math.round(pct * 100)}%`}</div>
      </div>
    </div>
  );
}
