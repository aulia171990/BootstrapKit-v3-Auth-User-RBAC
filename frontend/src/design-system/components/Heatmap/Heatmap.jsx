import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * Heatmap — grid of intensity cells (pure CSS grid, no chart lib). Interface only.
 * @param {Array<Array<number>>} data matrix of values (0..1 normalized, or raw)
 * @param {function(number, row, col)} colorOf returns a CSS color for a value
 * @param {Array} xLabels / yLabels optional axis labels
 */
export default function Heatmap({ data = [], colorOf, xLabels = [], yLabels = [], cellSize = 28, className, ...rest }) {
  const cols = data[0]?.length || 0;
  const cOf = colorOf || ((v) => `color-mix(in srgb, var(--ds-color-primary) ${Math.round((v ?? 0) * 100)}%, var(--ds-color-surface-2))`);
  return (
    <div className={cx('ds-heatmap', className)} style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }} role="img" aria-label="Heatmap" {...rest}>
      {data.flatMap((row, r) => row.map((v, c) => (
        <div key={`${r}-${c}`} className="ds-heatmap__cell" style={{ background: cOf(v, r, c) }} title={yLabels[r] ? `${yLabels[r]} / ${xLabels[c] ?? c}: ${v}` : `${v}`}>{v}</div>
      )))}
    </div>
  );
}
