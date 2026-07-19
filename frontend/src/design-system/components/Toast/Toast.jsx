import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

const ICONS = { success: CheckCircle2, warning: AlertTriangle, danger: XCircle, info: Info, primary: Info };

/**
 * Toast — single transient notification card.
 * @param {'success'|'warning'|'danger'|'info'|'primary'} tone
 * @param {string} placement legacy single-toast hint (region handles placement)
 * @param {function} onClose
 */
export default function Toast({ tone = 'info', title, children, icon, onClose, className, ...rest }) {
  const IconComp = icon ?? ICONS[tone] ?? ICONS.info;
  return (
    <div className={cx('ds-toast', className)} data-tone={tone} role="status" {...rest}>
      <span className="ds-toast__icon"><Icon icon={IconComp} size="md" /></span>
      <div className="ds-toast__content">
        {title && <div className="ds-toast__title">{title}</div>}
        {children}
      </div>
      {onClose && (
        <button type="button" className="ds-toast__close" onClick={onClose} aria-label="Dismiss">
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}
