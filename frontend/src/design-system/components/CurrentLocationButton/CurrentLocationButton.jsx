import React from 'react';
import { LocateFixed } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/** CurrentLocationButton — recenters map on the user's location. */
export default function CurrentLocationButton({ onClick, active, className, ...rest }) {
  return (
    <button type="button" className={cx('ds-map-button', active && 'ds-map-button--active', className)} aria-label="My location" onClick={onClick} {...rest}>
      <Icon icon={LocateFixed} size="sm" />
    </button>
  );
}
