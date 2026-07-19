import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Sidebar — vertical nav list with sections + links.
 * items: [{ id, label, icon?, href?, onClick?, active?, section? }]
 */
export default function Sidebar({ items = [], brand, width, className, ...rest }) {
  let lastSection = null;
  return (
    <aside className={cx('ds-sidebar', className)} style={width ? { '--ds-sidebar-w': width } : undefined} {...rest}>
      {brand && <div className="ds-sidebar__brand">{brand}</div>}
      {items.map((it) => {
        const node = (
          <a
            key={it.id}
            href={it.href ?? '#'}
            onClick={it.onClick}
            className={cx('ds-sidebar__link', it.active && 'is-active')}
            aria-current={it.active ? 'page' : undefined}
          >
            {it.icon && <span className="ds-sidebar__icon"><Icon icon={it.icon} size="sm" /></span>}
            <span>{it.label}</span>
          </a>
        );
        const out = [];
        if (it.section && it.section !== lastSection) { out.push(<div key={`s-${it.section}`} className="ds-sidebar__section">{it.section}</div>); lastSection = it.section; }
        out.push(node);
        return out;
      })}
    </aside>
  );
}
