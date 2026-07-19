import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * StatisticCard — big number + label + trend delta.
 * @param {string|number} value @param {string} label
 * @param {number} delta percentage (e.g. 12.5) → derived up/down
 * @param {'up'|'down'} direction override
 */
export default function StatisticCard({ value, label, delta, direction, prefix, suffix, className, ...rest }) {
  const dir = direction ?? (delta != null ? (delta >= 0 ? 'up' : 'down') : undefined);
  return (
    <div className={cx('ds-stat', className)} {...rest}>
      {label && <span className="ds-stat__label">{label}</span>}
      <span className="ds-stat__value">{prefix}{value}{suffix}</span>
      {delta != null && (
        <span className="ds-stat__delta" data-dir={dir}>
          {dir === 'up' ? <Icon icon={ArrowUpRight} size="xs" /> : <Icon icon={ArrowDownRight} size="xs" />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
  );
}
