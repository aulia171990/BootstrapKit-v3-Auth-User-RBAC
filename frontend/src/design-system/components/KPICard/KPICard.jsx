import React from 'react';
import MetricCard from '../MetricCard/index.js';
import Sparkline from '../Sparkline/index.js';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/**
 * KPICard — KPI tile: metric + optional sparkline trend.
 * @param {ReactElement} icon lucide icon
 * @param {Array<number>} trend optional sparkline data
 */
export default function KPICard({ icon, label, value, delta, direction, prefix, suffix, trend, tone = 'primary', title, extra, className, ...rest }) {
  return (
    <MetricCard
      icon={icon}
      label={label}
      title={title}
      value={value}
      delta={delta}
      direction={direction}
      prefix={prefix}
      suffix={suffix}
      className={cx(className)}
      extra={trend ? <Sparkline data={trend} color={`var(--ds-color-${tone})`} width={200} height={36} /> : extra}
      {...rest}
    />
  );
}
