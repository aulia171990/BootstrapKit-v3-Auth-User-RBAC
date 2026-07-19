import React from 'react';
import Card from '../Card/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * DashboardWidget — generic titled dashboard tile with header actions + body.
 * @param {string} title @param {ReactNode} actions
 */
export default function DashboardWidget({ title, actions, children, className, ...rest }) {
  return (
    <Card className={cx('ds-dash-widget', className)} {...rest}>
      {(title || actions) && (
        <div className="ds-dash-widget__head">
          {title && <div className="ds-dash-widget__title">{title}</div>}
          {actions}
        </div>
      )}
      {children}
    </Card>
  );
}
