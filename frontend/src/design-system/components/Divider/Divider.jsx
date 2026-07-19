import React from 'react';
import { cx } from '../_util.js';
import './Divider.css';

/** Divider — horizontal/vertical rule. */
export default function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  className,
  ...rest
}) {
  if (label) {
    return (
      <div className={cx('ds-divider', 'ds-divider--label', className)} role="separator" {...rest}>
        <span className="ds-divider__line" />
        <span className="ds-divider__label">{label}</span>
        <span className="ds-divider__line" />
      </div>
    );
  }
  return (
    <div
      className={cx('ds-divider', `ds-divider--${orientation}`, `ds-divider--${variant}`, className)}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    />
  );
}
