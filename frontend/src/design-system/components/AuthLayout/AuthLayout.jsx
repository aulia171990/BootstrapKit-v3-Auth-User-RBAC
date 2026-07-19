import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * AuthLayout — centered card for login/register/forgot-password screens.
 * @param {ReactNode} brand @param {ReactNode} children (form) @param {ReactNode} footer
 */
export default function AuthLayout({ brand, children, footer, className, ...rest }) {
  return (
    <div className={cx('ds-auth', className)} {...rest}>
      <div className="ds-auth__card">
        {brand && <div className="ds-auth__brand">{brand}</div>}
        {children}
        {footer && <div className="ds-auth__footer">{footer}</div>}
      </div>
    </div>
  );
}
