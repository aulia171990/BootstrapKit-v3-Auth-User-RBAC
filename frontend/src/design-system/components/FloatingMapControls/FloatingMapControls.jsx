import React from 'react';
import { cx } from '../_util.js';

/**
 * FloatingMapControls — positions a group of controls at a map corner.
 * @param {'tl'|'tr'|'bl'|'br'} position
 * @param {ReactNode} children control buttons
 */
export default function FloatingMapControls({ position = 'tr', children, className, ...rest }) {
  return (
    <div className={cx('ds-map-ctrl', `ds-map-ctrl--${position}`, 'ds-map-floating', className)} {...rest}>
      {children}
    </div>
  );
}
