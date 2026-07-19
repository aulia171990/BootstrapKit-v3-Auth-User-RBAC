import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * DashboardLayout — sidebar (left, full height) + topbar + scrollable content.
 * @param {ReactNode} sidebar @param {ReactNode} topbar @param {ReactNode} children
 * @param {boolean} collapsed collapses sidebar to icon rail
 */
export default function DashboardLayout({ sidebar, topbar, children, collapsed = false, className, ...rest }) {
  return (
    <div className={cx('ds-dash', className)} {...rest}>
      <aside className={cx('ds-dash__sidebar', collapsed && 'ds-dash__sidebar--collapse')}>{sidebar}</aside>
      {topbar && <div className="ds-dash__topbar">{topbar}</div>}
      <div className="ds-dash__content">{children}</div>
    </div>
  );
}
