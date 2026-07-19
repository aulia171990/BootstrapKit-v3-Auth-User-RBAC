import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Menu — list of actions (standalone or inside Dropdown).
 * items: [{ id, label, icon?, danger?, disabled?, separator?, onClick? }]
 */
export default function Menu({ items = [], className, ...rest }) {
  return (
    <ul className={cx('ds-menu', className)} role="menu" {...rest}>
      {items.map((it, i) =>
        it.separator ? (
          <li key={i} className="ds-menu__sep" role="separator" />
        ) : (
          <li key={it.id ?? i} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={it.disabled}
              className={cx('ds-menu__item', it.danger && 'is-danger')}
              onClick={it.onClick}
            >
              {it.icon && <span className="ds-menu__icon"><Icon icon={it.icon} size="sm" /></span>}
              {it.label}
            </button>
          </li>
        )
      )}
    </ul>
  );
}
