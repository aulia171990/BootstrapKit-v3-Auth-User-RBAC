import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * BottomNavigation — mobile bottom tab bar.
 * items: [{ id, label, icon, onClick?, active? }]
 */
export default function BottomNavigation({ items = [], className, ...rest }) {
  return (
    <nav className={cx('ds-bottom-nav', className)} {...rest}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={it.onClick}
          className={cx('ds-bottom-nav__item', it.active && 'is-active')}
          aria-current={it.active ? 'page' : undefined}
        >
          <span className="ds-bottom-nav__icon"><Icon icon={it.icon} size="md" /></span>
          {it.label}
        </button>
      ))}
    </nav>
  );
}
