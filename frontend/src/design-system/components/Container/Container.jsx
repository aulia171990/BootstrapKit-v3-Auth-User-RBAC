import React from 'react';
import { cx, space } from '../_util.js';
import './Container.css';

/** Container — responsive max-width centered wrapper. */
export default function Container({
  children,
  maxWidth = 'desktop',
  padding = 4,
  fluid = false,
  className,
  ...rest
}) {
  return (
    <div
      className={cx('ds-container', className)}
      style={{
        maxWidth: fluid ? 'none' : `var(--ds-bp-${maxWidth})`,
        paddingInline: space(padding),
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
