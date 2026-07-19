import React from 'react';
import { cx, space } from '../_util.js';
import './Surface.css';

/**
 * Surface — themed surface (bg + optional border/radius/shadow/padding).
 * The base building block for panels; lighter than Card.
 */
export default function Surface({
  children, p, px, py, radius = 'md', elevation = 'none',
  bordered = false, bg, className, style, ...rest
}) {
  return (
    <div
      className={cx('ds-surface', className)}
      data-elevation={elevation}
      style={{
        padding: space(p), paddingInline: px ? space(px) : undefined,
        paddingBlock: py ? space(py) : undefined,
        borderRadius: `var(--ds-radius-${radius})`,
        border: bordered ? '1px solid var(--ds-color-border)' : undefined,
        background: bg ? (bg.startsWith('--') ? `var(${bg})` : bg) : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
