import React from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/** KPIGrid — responsive auto-fit grid for KPI/metric cards. */
export default function KPIGrid({ children, className, ...rest }) {
  return <div className={cx('ds-kpi-grid', className)} {...rest}>{children}</div>;
}
