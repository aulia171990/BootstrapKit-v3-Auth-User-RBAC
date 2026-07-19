import React from 'react';
import Icon from '../Icon/index.js';
import Button from '../Button/index.js';
import { cx } from '../_util.js';

/**
 * IconButton — square/round button carrying a single lucide icon.
 * @param {ReactElement} icon lucide icon component (required)
 * @param {string} aria-label required for accessibility
 * @param {('xs'|'sm'|'md'|'lg'|'xl')} size
 * @param {('primary'|'secondary'|'outline'|'ghost'|'destructive'|'success'|'warning'|'link')} variant
 */
export default function IconButton({ icon, size = 'md', variant = 'ghost', 'aria-label': ariaLabel, className, ...rest }) {
  if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
    console.error('IconButton: a non-empty `aria-label` is required for accessibility.');
  }
  return (
    <Button
      circle
      variant={variant}
      size={size}
      leftIcon={icon}
      className={cx('ds-icon-btn', className)}
      ariaLabel={ariaLabel}
      {...rest}
    />
  );
}
