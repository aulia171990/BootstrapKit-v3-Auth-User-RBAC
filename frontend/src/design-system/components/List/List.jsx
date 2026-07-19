import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * List — row list, optionally bordered.
 * items: [{ id?, title, description?, leading? (lucide), trailing? (node), disabled? }]
 * @param {boolean} bordered
 */
export default function List({ items = [], bordered = false, className, ...rest }) {
  return (
    <ul className={cx('ds-list', bordered && 'ds-list--bordered', className)} {...rest}>
      {items.map((it, i) => (
        <li key={it.id ?? i} className={cx('ds-list__item', it.disabled && 'is-disabled')}>
          {it.leading && <span className="ds-list__leading"><Icon icon={it.leading} size="sm" /></span>}
          <span className="ds-list__content">
            {it.title && <span className="ds-list__title">{it.title}</span>}
            {it.description && <span className="ds-list__desc">{it.description}</span>}
          </span>
          {it.trailing && <span className="ds-list__trailing">{it.trailing}</span>}
        </li>
      ))}
    </ul>
  );
}
