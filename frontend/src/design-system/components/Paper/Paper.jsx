import React from 'react';
import { cx, space } from '../_util.js';
import '../Surface/Surface.css';

/**
 * Paper — elevated sheet (drop shadow + surface bg), like a floating Card.
 * @param {('xs'|'sm'|'md'|'lg'|'xl')} elevation
 */
export default function Paper({
  children, p = 6, px, py, radius = 'lg', elevation = 'md',
  className, style, ...rest
}) {
  return (
    <div
      className={cx('ds-paper', className)}
      data-elevation={elevation}
      style={{
        padding: space(p), paddingInline: px ? space(px) : undefined,
        paddingBlock: py ? space(py) : undefined,
        borderRadius: `var(--ds-radius-${radius})`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
