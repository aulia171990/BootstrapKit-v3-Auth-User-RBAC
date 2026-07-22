import React from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import './FloatingActionButton.css';

export default function FloatingActionButton({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  badge,
  size = 'md',
  color = 'primary',
  className,
  ...rest
}) {
  return (
    <button
      type="button"
      className={cx('ds-fab', `ds-fab--${position}`, `ds-fab--${size}`, `ds-fab--${color}`, className)}
      onClick={onClick}
      aria-label={label || 'Action'}
      {...rest}
    >
      {icon && <Icon icon={icon} size={size === 'sm' ? 'sm' : 'md'} />}
      {!icon && label && <span>{label?.[0] || '?'}</span>}
      {badge != null && (
        <span className="ds-fab__badge">{badge}</span>
      )}
    </button>
  );
}
