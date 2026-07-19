import React, { useState } from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * DockPanel — main content + a dockable bar (bottom or top) with toggleable tabs.
 * @param {Array<{key,label,content}>} panels
 * @param {'bottom'|'top'} position
 */
export default function DockPanel({ children, panels = [], position = 'bottom', initial, className, ...rest }) {
  const [active, setActive] = useState(initial != null ? initial : null);
  const current = panels.find((p) => p.key === active);
  return (
    <div className={cx('ds-dock', className)} {...rest}>
      <div className="ds-dock__content">{children}</div>
      <div className="ds-dock__bar" data-position={position}>
        {panels.map((p) => (
          <button key={p.key} type="button" className={cx('ds-dock__btn', active === p.key && 'ds-dock__btn--active')} aria-pressed={active === p.key} onClick={() => setActive(active === p.key ? null : p.key)}>
            {p.label}
          </button>
        ))}
      </div>
      {current && <div className="ds-panel__body" style={{ maxHeight: 240 }}>{current.content}</div>}
    </div>
  );
}
