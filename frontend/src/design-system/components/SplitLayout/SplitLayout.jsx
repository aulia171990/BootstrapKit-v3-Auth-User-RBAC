import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * SplitLayout — two panes with an optional divider (horizontal or vertical).
 * @param {'horizontal'|'vertical'} orientation
 * @param {ReactNode} start first pane @param {ReactNode} end second pane
 * @param {boolean} divider show a divider between panes
 */
export default function SplitLayout({ orientation = 'horizontal', start, end, divider = true, className, ...rest }) {
  return (
    <div className={cx('ds-split', className)} data-orientation={orientation} {...rest}>
      <div className="ds-split__pane">{start}</div>
      {divider && <div className="ds-split__divider" aria-hidden="true" />}
      <div className="ds-split__pane">{end}</div>
    </div>
  );
}
