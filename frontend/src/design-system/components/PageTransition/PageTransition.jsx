import React from 'react';
import { cx } from '../_util.js';
import './PageTransition.css';

export default function PageTransition({
  children,
  type = 'fade',
  duration = 'base',
  className,
  ...rest
}) {
  return (
    <div
      className={cx(`ds-page-transition ds-page-${type}`, className)}
      style={{ '--ds-page-dur': `var(--ds-duration-${duration})` }}
      {...rest}
    >
      {children}
    </div>
  );
}
