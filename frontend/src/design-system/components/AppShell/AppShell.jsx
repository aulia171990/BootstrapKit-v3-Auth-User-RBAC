import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * AppShell — Navbar (top) + Sidebar (left) + main content + optional footer.
 * @param {ReactNode} navbar @param {ReactNode} sidebar @param {ReactNode} children (content) @param {ReactNode} footer
 */
export default function AppShell({ navbar, sidebar, children, footer, className, ...rest }) {
  return (
    <div className={cx('ds-app-shell', className)} {...rest}>
      {navbar && <>{navbar}</>}
      <div className="ds-app-shell__body">
        {sidebar && <>{sidebar}</>}
        <main className="ds-app-shell__main">
          <div className="ds-app-shell__content">{children}</div>
          {footer}
        </main>
      </div>
    </div>
  );
}
