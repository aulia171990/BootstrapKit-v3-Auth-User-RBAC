import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * Sparkline — tiny inline trend line (pure SVG, no chart lib).
 * @param {Array<number>} data values
 * @param {number} width @param {number} height
 * @param {string} color stroke color (defaults to primary)
 * @param {boolean} fill area fill
 */
export default function Sparkline({ data = [], width = 120, height = 32, color = 'var(--ds-color-primary)', fill = true, strokeWidth = 2, className, ...rest }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / span) * (height - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg className={cx('ds-sparkline', className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend sparkline" {...rest}>
      {fill && <path d={area} fill={color} opacity={0.15} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
