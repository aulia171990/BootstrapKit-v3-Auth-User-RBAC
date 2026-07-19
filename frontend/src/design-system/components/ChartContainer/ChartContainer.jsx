import React from 'react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * ChartContainer — standard chart frame: optional title/subtitle/actions + body slot.
 * Wraps any chart (lib-based or SVG). Handles empty/loading via props.
 */
export default function ChartContainer({ title, subtitle, actions, children, className, ...rest }) {
  return (
    <div className={cx('ds-chart', className)} {...rest}>
      {(title || actions) && (
        <div className="ds-chart__head">
          <div>
            {title && <div className="ds-chart__title">{title}</div>}
            {subtitle && <div className="ds-chart__subtitle">{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      <div className="ds-chart__canvas">{children}</div>
    </div>
  );
}
