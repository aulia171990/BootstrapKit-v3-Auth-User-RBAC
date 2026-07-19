import React from 'react';
import { cx, space } from '../_util.js';
import './Stack.css';

/**
 * Stack — vertical (default) or horizontal flex layout with consistent gap.
 * @param {('vertical'|'horizontal')} direction
 * @param {1..24} gap spacing scale key
 * @param {boolean} wrap allow flex wrap
 */
export default function Stack({
  children,
  direction = 'vertical',
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  ...rest
}) {
  return (
    <div
      className={cx('ds-stack', `ds-stack--${direction}`, className)}
      style={{
        gap: space(gap),
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
