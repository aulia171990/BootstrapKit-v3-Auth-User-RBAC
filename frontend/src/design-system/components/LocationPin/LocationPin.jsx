import React from 'react';
import { MapPin, Check } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/**
 * LocationPin — a selectable location row (search result / saved place).
 * @param {string} title @param {string} subtitle
 * @param {boolean} active selected state
 * @param {function} onClick
 */
export default function LocationPin({ title, subtitle, active, onClick, className, ...rest }) {
  return (
    <button type="button" className={cx('ds-locpin', active && 'ds-locpin--active', className)} onClick={onClick} aria-pressed={active} {...rest}>
      <span className="ds-locpin__icon"><Icon icon={active ? Check : MapPin} size="sm" /></span>
      <span className="ds-locpin__body">
        <span className="ds-locpin__title">{title}</span>
        {subtitle && <span className="ds-locpin__sub">{subtitle}</span>}
      </span>
    </button>
  );
}
