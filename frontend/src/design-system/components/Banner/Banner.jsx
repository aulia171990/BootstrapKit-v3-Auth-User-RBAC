import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, Megaphone, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle, primary: Megaphone };

/**
 * Banner — full-width page-level announcement bar (sticky optional).
 * @param {'primary'|'success'|'warning'|'danger'|'info'} tone
 * @param {boolean} sticky position: sticky at top
 * @param {boolean} closable
 */
export default function Banner({ tone = 'info', title, children, icon, sticky, closable, onClose, className, ...rest }) {
  const IconComp = icon ?? ICONS[tone] ?? ICONS.info;
  return (
    <div
      className={cx('ds-banner', className)}
      data-tone={tone}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      style={sticky ? { position: 'sticky', top: 0, zIndex: 'var(--ds-z-sticky)' } : undefined}
      {...rest}
    >
      <span className="ds-banner__icon"><Icon icon={IconComp} size="md" /></span>
      <div className="ds-banner__content">
        {title && <div className="ds-banner__title">{title}</div>}
        {children}
      </div>
      {closable && (
        <button type="button" className="ds-banner__close" onClick={onClose} aria-label="Dismiss">
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}
