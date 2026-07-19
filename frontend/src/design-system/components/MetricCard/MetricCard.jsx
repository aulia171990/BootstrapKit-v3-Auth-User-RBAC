import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import StatisticCard from '../StatisticCard/index.js';
import '../../components/__data.css';

/**
 * MetricCard — card wrapping a StatisticCard with icon + optional extra (sparkline/chart) slot.
 * @param {ReactElement} icon lucide icon component
 * @param {ReactNode} extra rendered below the statistic (e.g. mini chart)
 */
export default function MetricCard({ icon, label, value, delta, direction, prefix, suffix, title, extra, className, ...rest }) {
  return (
    <div className={cx('ds-metric', className)} {...rest}>
      <div className="ds-metric__head">
        <span className="ds-metric__icon"><Icon icon={icon} size="md" /></span>
        {title && <span className="ds-stat__label">{title}</span>}
      </div>
      <StatisticCard label={label} value={value} delta={delta} direction={direction} prefix={prefix} suffix={suffix} />
      {extra && <div>{extra}</div>}
    </div>
  );
}
