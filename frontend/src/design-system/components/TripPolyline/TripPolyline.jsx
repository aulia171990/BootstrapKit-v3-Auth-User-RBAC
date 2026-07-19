import React from 'react';
import { cx } from '../_util.js';

/**
 * TripPolyline — SVG path overlay connecting waypoints [x%, y%] within the map.
 * Library-agnostic; sits inside .ds-map as an absolutely positioned svg.
 * @param {Array<[number,number]>} points percentage coords
 * @param {string} color CSS color (default token primary)
 * @param {number} width stroke width px
 * @param {boolean} dashed
 */
export default function TripPolyline({ points = [], color = 'var(--ds-color-primary)', width = 4, dashed = false, className, ...rest }) {
  if (points.length < 2) return null;
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  return (
    <svg className={cx('ds-map-svg', className)} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" {...rest}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '3 3' : undefined} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
