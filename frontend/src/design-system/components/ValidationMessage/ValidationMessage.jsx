import React from 'react';
import { AlertCircle } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/**
 * ValidationMessage — inline error text for a field (sets role=alert).
 * @param {string} id associate with the control's aria-describedby / aria-errormessage
 * @param {ReactNode} children message; renders nothing when empty
 */
export default function ValidationMessage({ id, children, className }) {
  if (children == null || children === '') return null;
  return (
    <span id={id} role="alert" className={cx('ds-field__error', className)}>
      <Icon icon={AlertCircle} size="xs" />
      <span>{children}</span>
    </span>
  );
}
