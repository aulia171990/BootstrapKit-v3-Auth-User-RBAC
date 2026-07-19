import React from 'react';
import { cx } from '../_util.js';

/**
 * HeatmapInterface — intensity blobs over the map (interface only, no map lib).
 * @param {Array<{x:number,y:number,weight:number,color?:string}>} points percentage coords + weight 0..1
 */
export default function HeatmapInterface({ points = [], radius = 14, className, ...rest }) {
  return (
    <div className={cx('ds-heat', className)} aria-hidden="true" {...rest}>
      <svg className="ds-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={radius * (p.weight ?? 0.5)} fill={p.color || 'var(--ds-color-danger)'} opacity={0.5 * (p.weight ?? 0.5) + 0.15} />
        ))}
      </svg>
    </div>
  );
}
