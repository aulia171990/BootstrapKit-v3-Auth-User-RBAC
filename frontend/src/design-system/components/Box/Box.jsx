import React from 'react';
import { cx, space } from '../_util.js';

/** Box — generic styled container (padding/margin/radius/shadow/background). */
export default function Box({
  children,
  p,
  px,
  py,
  m,
  mt,
  mb,
  radius = 'md',
  elevation,
  bg,
  className,
  style,
  ...rest
}) {
  const s = {
    padding: space(p),
    paddingInline: px ? space(px) : undefined,
    paddingBlock: py ? space(py) : undefined,
    margin: space(m),
    marginTop: mt ? space(mt) : undefined,
    marginBottom: mb ? space(mb) : undefined,
    borderRadius: `var(--ds-radius-${radius})`,
    boxShadow: elevation ? `var(--ds-shadow-${elevation})` : undefined,
    background: bg ? (bg.startsWith('--') ? `var(${bg})` : bg) : undefined,
    ...style,
  };
  return (
    <div className={cx('ds-box', className)} style={s} {...rest}>
      {children}
    </div>
  );
}
