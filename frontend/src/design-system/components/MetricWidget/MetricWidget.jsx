import React from 'react';
import { cx } from '../_util.js';
import Icon from '../Icon/index.js';
import '../_enterprise/_enterprise.css';

/**
 * MetricWidget — compact KPI tile (icon, label, big value, delta, optional sparkline).
 * @param {ReactElement} icon lucide icon
 * @param {number} delta percentage change (sign drives up/down color)
 * @param {ReactNode} sparkline optional inline chart
 */
export default function MetricWidget({ icon, label, value, delta, prefix, suffix, sparkline, tone = 'primary', className, ...rest }) {
  const dir = delta == null ? null : delta >= 0 ? 'up' : 'down';
  return (
    <div className={cx('ds-metric-widget', className)} {...rest}>
      <div className="ds-metric-widget__head">
        {icon && <span className="ds-metric-widget__icon" style={{ color: `var(--ds-color-${tone})` }}><Icon icon={icon} size="md" /></span>}
        {dir && <span className={cx('ds-metric-widget__delta', `ds-metric-widget__delta--${dir}`)}>{dir === 'up' ? '▲' : '▼'} {Math.abs(delta)}%</span>}
      </div>
      <div className="ds-metric-widget__label">{label}</div>
      <div className="ds-metric-widget__value">{prefix}{value}{suffix}</div>
      {sparkline && <div>{sparkline}</div>}
    </div>
  );
}
