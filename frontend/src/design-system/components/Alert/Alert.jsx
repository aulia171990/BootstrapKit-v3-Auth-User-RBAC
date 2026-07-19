import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

const ICONS = {
  primary: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle, info: Info,
};
const DEFAULT_TONE = 'info';

/**
 * Alert — inline status banner.
 * @param {'primary'|'success'|'warning'|'danger'|'info'} tone
 * @param {ReactNode} title
 * @param {ReactNode} children description
 * @param {boolean} closable
 * @param {function} onClose
 */
export default function Alert({ tone = DEFAULT_TONE, title, children, icon, closable, onClose, className, ...rest }) {
  const IconComp = icon ?? ICONS[tone] ?? ICONS[DEFAULT_TONE];
  return (
    <div className={cx('ds-alert', className)} data-tone={tone} role="alert" {...rest}>
      <span className="ds-alert__icon"><Icon icon={IconComp} size="md" /></span>
      <div className="ds-alert__content">
        {title && <div className="ds-alert__title">{title}</div>}
        {children}
      </div>
      {closable && (
        <button type="button" className="ds-alert__close" onClick={onClose} aria-label="Dismiss">
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}
