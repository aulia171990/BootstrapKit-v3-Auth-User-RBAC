import React from 'react';
import { cx } from '../_util.js';
import '../typography.css';

/**
 * Label — form label with optional required marker.
 * @param {string} htmlFor associate with an input id
 * @param {boolean} required shows a red asterisk
 */
export default function Label({ children, htmlFor, required, disabled, className, ...rest }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cx('ds-label', disabled && 'is-disabled', className)}
      {...rest}
    >
      {children}
      {required && <span className="ds-label__req" aria-hidden="true">*</span>}
    </label>
  );
}
