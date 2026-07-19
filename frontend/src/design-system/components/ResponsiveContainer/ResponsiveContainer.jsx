import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/** ResponsiveContainer — centered max-width wrapper with fluid padding. */
export default function ResponsiveContainer({ children, className, ...rest }) {
  return (
    <div className={cx('ds-rcontainer', className)} {...rest}>
      {children}
    </div>
  );
}
