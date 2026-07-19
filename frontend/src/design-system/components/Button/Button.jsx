import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import './Button.css';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning', 'link'];
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * Button — enterprise button.
 * @param {('primary'|'secondary'|'outline'|'ghost'|'destructive'|'success'|'warning'|'link')} variant
 * @param {('xs'|'sm'|'md'|'lg'|'xl')} size
 * @param {ReactElement} leftIcon lucide icon component
 * @param {ReactElement} rightIcon
 * @param {boolean} loading shows spinner, sets aria-busy, disables
 * @param {boolean} fullWidth
 * @param {boolean} circle square/round icon button (use with IconButton)
 * @param {string} ariaLabel accessible name (required for icon-only buttons)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  circle = false,
  type = 'button',
  disabled = false,
  ariaLabel,
  className,
  ...rest
}) {
  if (!VARIANTS.includes(variant)) variant = 'primary';
  if (!SIZES.includes(size)) size = 'md';
  const isDisabled = disabled || loading;
  const resolvedVariant = variant === 'destructive' ? 'danger' : variant;
  const isIconOnly = children == null;
  return (
    <button
      type={type}
      className={cx(
        'ds-btn',
        `ds-btn--${resolvedVariant}`,
        `ds-btn--${size}`,
        fullWidth && 'ds-btn--block',
        circle && 'ds-btn--circle',
        loading && 'is-loading',
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={isIconOnly ? ariaLabel : undefined}
      {...rest}
    >
      {loading && (
        <span className="ds-btn__spinner" aria-hidden="true">
          <span className="ds-btn__ring" />
        </span>
      )}
      {!loading && leftIcon && <Icon icon={leftIcon} size="sm" className="ds-btn__icon" />}
      {children != null && <span className="ds-btn__label">{children}</span>}
      {!loading && rightIcon && <Icon icon={rightIcon} size="sm" className="ds-btn__icon" />}
    </button>
  );
}
