import React from 'react';
import { cx, space } from '../_util.js';
import './Grid.css';

/**
 * Grid — CSS grid with column count + responsive behavior.
 * @param {number|string} columns fixed column count (e.g. 3 or '1fr 2fr')
 * @param {1..24} gap
 * @param {number} minColWidth responsive auto-fit min column width (px)
 */
export default function Grid({
  children,
  columns,
  minColWidth,
  gap = 4,
  className,
  style,
  ...rest
}) {
  const gridTemplateColumns = minColWidth
    ? `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`
    : typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;
  return (
    <div
      className={cx('ds-grid', className)}
      style={{ gridTemplateColumns, gap: space(gap), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
