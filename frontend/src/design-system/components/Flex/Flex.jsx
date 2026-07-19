import React from 'react';
import { cx, space } from '../_util.js';
import './Flex.css';

/** Flex — generic flex container with align/justify/gap/wrap controls. */
export default function Flex({
  children,
  direction = 'row',
  align = 'center',
  justify,
  gap,
  wrap = false,
  inline = false,
  className,
  ...rest
}) {
  return (
    <div
      className={cx('ds-flex', className)}
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: gap ? space(gap) : undefined,
        flexWrap: wrap ? 'wrap' : undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
