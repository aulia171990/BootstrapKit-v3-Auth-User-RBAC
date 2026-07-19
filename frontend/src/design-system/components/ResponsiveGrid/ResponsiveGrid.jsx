import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * ResponsiveGrid — grid with a base column count that steps up per breakpoint.
 * @param {number} cols base columns (default 1)
 * @param {number} colsSm @param {number} colsMd @param {number} colsLg @param {number} colsXl
 *   step columns at the sm(640)/md(1024)/lg(1280)/xl(1536) breakpoints
 * @param {1..24} gap
 */
export default function ResponsiveGrid({ cols = 1, colsSm, colsMd, colsLg, colsXl, gap = 4, className, style, children, ...rest }) {
  return (
    <div
      className={cx('ds-rgrid', className)}
      data-cols={cols}
      data-cols-sm={colsSm}
      data-cols-md={colsMd}
      data-cols-lg={colsLg}
      data-cols-xl={colsXl}
      style={{ gap: `var(--ds-space-${gap})`, '--ds-rgrid-sm': colsSm, '--ds-rgrid-md': colsMd, '--ds-rgrid-lg': colsLg, '--ds-rgrid-xl': colsXl, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
