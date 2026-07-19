import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * ResponsiveSidebar — fixed desktop rail that becomes an off-canvas drawer on mobile.
 * @param {ReactNode} brand shown at top (desktop)
 * @param {ReactNode} children nav content
 * @param {boolean} collapsible show desktop collapse toggle
 * @param {boolean} open (mobile) controlled drawer open
 * @param {function} onOpenChange
 */
export default function ResponsiveSidebar({ brand, children, collapsible = true, open, onOpenChange, className, ...rest }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open ?? internal;
  const set = (v) => { if (open === undefined) setInternal(v); onOpenChange?.(v); };
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="ds-rsidebar__backdrop" onClick={() => set(false)} aria-hidden="true" />
      )}
      <aside
        className={cx('ds-rsidebar', collapsed && 'is-collapsed', isOpen && 'is-open', className)}
        {...rest}
      >
        {brand && <div className="ds-rsidebar__label" style={{ fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-text-strong)', padding: 'var(--ds-space-2) var(--ds-space-3)' }}>{brand}</div>}
        {collapsible && (
          <button
            type="button"
            className="ds-rsidebar__toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((c) => !c)}
          >
            <Icon icon={collapsed ? PanelLeftOpen : PanelLeftClose} size="sm" />
          </button>
        )}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</div>
        {isOpen && (
          <button type="button" className="ds-rsidebar__toggle ds-rsidebar__close" aria-label="Close" onClick={() => set(false)}>
            <Icon icon={X} size="sm" />
          </button>
        )}
      </aside>
    </>
  );
}
