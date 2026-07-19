import React from 'react';
import { cx } from '../_util.js';

/**
 * CharacterCounter — shows used / max with tone states.
 * @param {number} value current length
 * @param {number} max maximum length
 */
export default function CharacterCounter({ value = 0, max, className }) {
  const over = max != null && value > max;
  return (
    <span
      className={cx('ds-counter', over && 'is-over', className)}
      aria-live="polite"
    >
      {value}{max != null ? ` / ${max}` : ''}
    </span>
  );
}
