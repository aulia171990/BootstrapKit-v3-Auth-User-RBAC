import React from 'react';
import { Compass as CompassIcon } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/**
 * Compass — rotates to heading.
 * @param {number} heading degrees (0 = north, clockwise)
 */
export default function Compass({ heading = 0, onClick, className, ...rest }) {
  return (
    <button type="button" className={cx('ds-map-button', className)} aria-label="Compass" onClick={onClick} style={{ transform: `rotate(${-heading}deg)` }} {...rest}>
      <Icon icon={CompassIcon} size="sm" />
    </button>
  );
}
