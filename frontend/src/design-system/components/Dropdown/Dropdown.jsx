import React, { useState, useRef, useEffect } from 'react';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Dropdown — trigger + popover menu (controlled open optional).
 * @param {ReactNode} trigger the clickable trigger element
 * @param {ReactNode} children menu content (e.g. <Menu .../>)
 * @param {'start'|'end'} align
 */
export default function Dropdown({ trigger, children, align = 'start', open: openProp, onOpenChange, className, ...rest }) {
  const [open, setOpen] = useState(openProp ?? false);
  const ref = useRef(null);
  const isOpen = openProp ?? open;
  const set = (v) => { if (openProp === undefined) setOpen(v); onOpenChange?.(v); };

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) set(false); };
    const onEsc = (e) => { if (e.key === 'Escape') set(false); };
    if (isOpen) { document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onEsc); }
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc); };
  }, [isOpen]);

  return (
    <div className={cx('ds-dropdown', className)} ref={ref} {...rest}>
      <span onClick={() => set(!isOpen)} style={{ display: 'inline-flex', cursor: 'pointer' }}>
        {trigger}
      </span>
      {isOpen && (
        <div className="ds-dropdown__menu" data-align={align} role="menu">
          {children}
        </div>
      )}
    </div>
  );
}
