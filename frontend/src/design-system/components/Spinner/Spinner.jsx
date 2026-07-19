import React from 'react';
import { cx } from '../_util.js';
import './Spinner.css';

/** Spinner — loading indicator, tone + size driven by tokens. */
export default function Spinner({ size = 'md', tone = 'primary', className, label = 'Loading', ...rest }) {
  const px = typeof size === 'number' ? size : { sm: 16, md: 24, lg: 32, xl: 40 }[size] || 24;
  return (
    <span
      className={cx('ds-spinner', className)}
      role="status"
      aria-label={label}
      style={{ width: px, height: px }}
      {...rest}
    >
      <span className="ds-spinner__ring" />
    </span>
  );
}
