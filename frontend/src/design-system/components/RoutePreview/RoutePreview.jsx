import React from 'react';
import TripPolyline from '../TripPolyline/index.js';
import { cx } from '../_util.js';
import '../_maps/_maps.css';

/**
 * RoutePreview — route summary card + polyline preview.
 * @param {string} title
 * @param {Array<{label,value}>} stats e.g. distance, duration, fare
 * @param {Array<[number,number]>} points polyline coords (optional preview over map)
 * @param {ReactNode} actions e.g. a "Start trip" button
 */
export default function RoutePreview({ title = 'Route', stats = [], points, actions, className, ...rest }) {
  return (
    <div className={cx('ds-route', className)} {...rest}>
      <div className="ds-route__head">
        <span className="ds-route__title">{title}</span>
        {actions}
      </div>
      {points?.length > 1 && <TripPolyline points={points} />}
      <div className="ds-route__summary">
        {stats.map((s, i) => (
          <div key={i} className="ds-route__stat">
            <span className="ds-route__stat-label">{s.label}</span>
            <span className="ds-route__stat-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
