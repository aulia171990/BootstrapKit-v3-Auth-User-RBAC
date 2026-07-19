import React from 'react';
import { cx } from '../_util.js';
import Toast from '../Toast/index.js';
import '../../components/__feedback.css';

/**
 * Snackbar — region that renders a stack of Toasts at a placement.
 * @param {'top-start'|'top-center'|'top-end'|'bottom-start'|'bottom-center'|'bottom-end'} placement
 * @param {Array<{id, tone?, title?, children?, icon?}>} toasts
 * @param {function(id)} onDismiss
 */
export default function Snackbar({ placement = 'bottom-end', toasts = [], onDismiss, className, ...rest }) {
  return (
    <div className={cx('ds-toast-region', className)} data-placement={placement} {...rest}>
      {toasts.map((t) => (
        <Toast key={t.id} tone={t.tone} title={t.title} icon={t.icon} onClose={() => onDismiss?.(t.id)}>
          {t.children}
        </Toast>
      ))}
    </div>
  );
}
