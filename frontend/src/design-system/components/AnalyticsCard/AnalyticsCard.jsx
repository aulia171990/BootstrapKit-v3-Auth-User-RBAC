import React from 'react';
import Card from '../Card/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * AnalyticsCard — titled card hosting a chart + summary stats.
 * @param {string} title @param {string} subtitle
 * @param {ReactNode} chart the chart element (LineChart/BarChart/...)
 * @param {Array<{label,value}>} stats
 * @param {ReactNode} actions header actions
 */
export default function AnalyticsCard({ title, subtitle, chart, stats = [], actions, className, ...rest }) {
  return (
    <Card className={cx('ds-analytics', className)} {...rest}>
      <div className="ds-analytics__head">
        <div>
          {title && <div className="ds-analytics__title">{title}</div>}
          {subtitle && <div className="ds-analytics__sub">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {chart}
      {stats.length > 0 && (
        <div className="ds-route__summary">
          {stats.map((s, i) => (
            <div key={i} className="ds-route__stat">
              <span className="ds-route__stat-label">{s.label}</span>
              <span className="ds-route__stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
