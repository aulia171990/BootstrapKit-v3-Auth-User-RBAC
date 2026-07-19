import React from 'react';
import { X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx, TONE_VAR } from '../_util.js';
import './Chip.css';

/** Chip — compact tag, optionally dismissible / with icon. */
export default function Chip({
  children,
  tone = 'neutral',
  icon,
  onRemove,
  size = 'md',
  className,
  ...rest
}) {
  return (
    <span
      className={cx('ds-chip', `ds-chip--${size}`, className)}
      style={{
        '--ds-chip-color': TONE_VAR[tone] || 'var(--ds-color-text-muted)',
        '--ds-chip-bg': 'color-mix(in srgb, var(--ds-chip-color) 12%, var(--ds-color-surface))',
      }}
      {...rest}
    >
      {icon && <Icon icon={icon} size="sm" className="ds-chip__icon" />}
      <span className="ds-chip__label">{children}</span>
      {onRemove && (
        <button type="button" className="ds-chip__remove" onClick={onRemove} aria-label="Remove">
          <Icon icon={X} size="xs" />
        </button>
      )}
    </span>
  );
}
