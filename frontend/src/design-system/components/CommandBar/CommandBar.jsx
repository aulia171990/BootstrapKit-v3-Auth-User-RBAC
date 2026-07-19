import React from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * CommandBar — quick-action / view-switch bar (toggleable chips).
 * @param {Array<{key,label,icon?}>} items
 * @param {string|Array} value selected key(s)
 * @param {'single'|'multi'} mode
 */
export default function CommandBar({ items = [], value, onSelect, mode = 'single', className, ...rest }) {
  const selected = (k) => (mode === 'multi' ? (value || []).includes(k) : value === k);
  const handle = (k) => {
    if (mode === 'multi') {
      const cur = value || [];
      onSelect?.(cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]);
    } else onSelect?.(k);
  };
  return (
    <div className={cx('ds-commandbar', className)} role="toolbar" aria-label="Quick actions" {...rest}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          className={cx('ds-map-button', selected(it.key) && 'ds-map-button--active')}
          aria-pressed={selected(it.key)}
          onClick={() => handle(it.key)}
          title={it.label}
        >
          {it.icon ? <span style={{ display: 'inline-flex' }}>{it.icon}</span> : it.label}
        </button>
      ))}
    </div>
  );
}
