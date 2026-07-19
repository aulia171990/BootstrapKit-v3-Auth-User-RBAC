import React from 'react';
import Icon from '../Icon/index.js';
import { BarChart3 } from 'lucide-react';
import { cx } from '../_util.js';
import '../_charts/_charts.css';

/** EmptyChart — friendly empty state for a chart area. */
export default function EmptyChart({ title = 'No data yet', description, icon, className, ...rest }) {
  return (
    <div className={cx('ds-chart-empty', className)} {...rest}>
      <span className="ds-chart-empty__icon"><Icon icon={icon ?? BarChart3} size="lg" /></span>
      <div className="ds-chart-empty__title">{title}</div>
      {description && <div className="ds-chart-empty__desc">{description}</div>}
    </div>
  );
}
