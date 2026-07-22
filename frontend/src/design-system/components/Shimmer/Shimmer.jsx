import React from 'react';
import { cx } from '../_util.js';
import './Shimmer.css';

export default function Shimmer({ width, height, radius = 'md', className, ...rest }) {
  return (
    <span
      className={cx('ds-shimmer', className)}
      aria-hidden="true"
      style={{ width, height, borderRadius: `var(--ds-radius-${radius})` }}
      {...rest}
    />
  );
}
