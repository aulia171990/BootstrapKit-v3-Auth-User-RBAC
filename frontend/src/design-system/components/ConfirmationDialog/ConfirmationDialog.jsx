import React from 'react';
import { AlertTriangle, Info, CheckCircle2, HelpCircle } from 'lucide-react';
import Dialog from '../Dialog/index.js';
import Button from '../Button/index.js';
import Icon from '../Icon/index.js';
import '../../components/__feedback.css';

const ICONS = { warning: AlertTriangle, danger: AlertTriangle, info: Info, success: CheckCircle2 };

/**
 * ConfirmationDialog — question modal with confirm/cancel.
 * @param {'warning'|'danger'|'info'|'success'|'primary'} tone
 * @param {function} onConfirm
 */
export default function ConfirmationDialog({
  open, onClose, onConfirm, title = 'Are you sure?', message, tone = 'warning',
  confirmText = 'Confirm', cancelText = 'Cancel', loading = false, ...rest
}) {
  const icon = ICONS[tone] ?? HelpCircle;
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={loading}>{cancelText}</Button>
      <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );
  return (
    <Dialog open={open} onClose={onClose} width="420px" footer={footer} {...rest}>
      <div style={{ display: 'flex', gap: 'var(--ds-space-4)', alignItems: 'flex-start' }}>
        <span className="ds-state__icon" data-tone={tone} style={{ width: 'var(--ds-space-12)', height: 'var(--ds-space-12)' }}>
          <Icon icon={icon} size="lg" />
        </span>
        <div>
          <h3 className="ds-modal__title" style={{ marginBottom: 'var(--ds-space-2)' }}>{title}</h3>
          {message && <p style={{ margin: 0, color: 'var(--ds-color-text-muted)', fontSize: 'var(--ds-text-body-sm-size)' }}>{message}</p>}
        </div>
      </div>
    </Dialog>
  );
}
