import React, { useState, useRef, useEffect, useId } from 'react';
import { cx } from '../_util.js';
import '../../components/__feedback.css';
import './Popover.css';

/**
 * Popover — trigger-anchored floating panel.
 * @param {ReactNode} trigger clickable element (wrapped in a button if not focusable)
 * @param {ReactNode} children panel content
 * @param {'top'|'bottom'|'left'|'right'} placement
 * @param {boolean} dismissable close on outside click / Esc
 */
export default function Popover({ trigger, children, placement = 'bottom', dismissable = true, className, ...rest }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open || !dismissable) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc); };
  }, [open, dismissable]);

  return (
    <span className={cx('ds-popover', className)} ref={wrapRef}>
      <button
        type="button"
        className="ds-popover__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          className={cx('ds-popover__panel', `ds-popover--${placement}`)}
          {...rest}
        >
          {children}
        </div>
      )}
    </span>
  );
}
