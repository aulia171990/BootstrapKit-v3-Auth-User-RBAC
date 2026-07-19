import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Navbar — top sticky bar.
 * @param {ReactNode} brand logo/title
 * @param {ReactNode} children center items
 * @param {ReactNode} actions right-aligned actions
 */
export default function Navbar({ brand, children, actions, className, ...rest }) {
  return (
    <nav className={cx('ds-navbar', className)} {...rest}>
      {brand && <div className="ds-navbar__brand">{brand}</div>}
      {children && <div className="ds-navbar__items">{children}</div>}
      {actions && <div className="ds-navbar__actions">{actions}</div>}
    </nav>
  );
}
