import React from 'react';
import { cx } from '../_util.js';

/**
 * HelperText — neutral guidance under a field.
 * @param {string} id associate with the control's aria-describedby
 * @param {ReactNode} children
 */
export default function HelperText({ id, children, className }) {
  if (children == null) return null;
  return (
    <span id={id} className={cx('ds-field__hint', className)}>
      {children}
    </span>
  );
}
