import React from 'react';
import { Car, User } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/**
 * Internal base map marker.
 * @param {[number,number]} position [x%, y%] within the map (library-agnostic)
 * @param {ReactElement} icon lucide icon
 * @param {string} tone color token name
 */
export default function BaseMarker({ position = [50, 50], icon, tone, label, active, pulse, className, onClick, ...rest }) {
  const [x, y] = position;
  return (
    <div
      className={cx('ds-marker', active && 'ds-marker--active', tone && `ds-marker--tone-${tone}`, className)}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      {...rest}
    >
      {pulse && <span className="ds-marker__pulse" />}
      <span className="ds-marker__pin"><Icon icon={icon} size="sm" /></span>
      {label && <span className="ds-marker__label">{label}</span>}
    </div>
  );
}

export function DriverMarker(props) {
  return <BaseMarker {...props} icon={props.icon ?? Car} className={cx('ds-marker--driver', props.className)} />;
}

export function CustomerMarker(props) {
  return <BaseMarker {...props} icon={props.icon ?? User} className={cx('ds-marker--customer', props.className)} />;
}
