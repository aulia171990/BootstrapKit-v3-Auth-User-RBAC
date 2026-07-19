import React from 'react';
import Dialog from '../Dialog/index.js';
import Button from '../Button/index.js';
import '../../components/__feedback.css';

/**
 * Modal — semantic preset over Dialog with default footer actions.
 * @param {boolean} open @param {function} onClose
 * @param {string} title @param {ReactNode} children body
 * @param {function} onConfirm primary action
 * @param {string} confirmText @param {string} confirmVariant
 * @param {boolean} loading disables actions + shows spinner
 */
export default function Modal({
  open, onClose, title, children, confirmText = 'OK', cancelText = 'Cancel',
  onConfirm, confirmVariant = 'primary', loading = false, confirmDisabled, width, ...rest
}) {
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={loading}>{cancelText}</Button>
      {onConfirm && (
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading} disabled={confirmDisabled || loading}>
          {confirmText}
        </Button>
      )}
    </>
  );
  return (
    <Dialog open={open} onClose={onClose} title={title} width={width} footer={footer} {...rest}>
      {children}
    </Dialog>
  );
}
