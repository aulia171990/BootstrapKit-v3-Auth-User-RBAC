import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import { usePortal, useFocusTrap } from '../_overlay.js';
import '../../components/__nav.css';

/**
 * Drawer — side panel with overlay, esc-to-close, body scroll lock, focus trap, portal.
 * @param {boolean} open
 * @param {function} onClose
 * @param {'left'|'right'|'top'|'bottom'} side default 'right'
 * @param {ReactNode} title header title
 * @param {ReactNode} footer optional footer
 */
export default function Drawer({ open, onClose, side = 'right', title, footer, width, children, className, ...rest }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = prev; };
  }, [open, onClose, side]);

  if (!open) return null;

  const content = (
    <>
      <div className="ds-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={cx('ds-drawer', className)}
        data-side={side}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        style={width ? { '--ds-drawer-w': width } : undefined}
        {...rest}
      >
        {(title || onClose) && (
          <div className="ds-drawer__header">
            {title && <div className="ds-drawer__title">{title}</div>}
            {onClose && (
              <button type="button" className="ds-drawer__close" onClick={onClose} aria-label="Close">
                <Icon icon={X} size="sm" />
              </button>
            )}
          </div>
        )}
        <div className="ds-drawer__body">{children}</div>
        {footer && <div className="ds-drawer__footer">{footer}</div>}
      </div>
    </>
  );

  return usePortal(content, open);
}
