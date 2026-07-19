import React from 'react';
import { cx } from '../_util.js';
import './Tooltip.css';

/**
 * Tooltip — CSS-driven hover/focus popover around a single trigger child.
 * @param {ReactNode} content tooltip text/element
 * @param {'top'|'bottom'|'left'|'right'} placement
 * @param {ReactElement} children single focusable trigger
 */
export default function Tooltip({ content, placement = 'top', children, className, ...rest }) {
  return (
    <span className={cx('ds-tooltip', `ds-tooltip--${placement}`, className)} {...rest}>
      {children}
      <span className="ds-tooltip__bubble" role="tooltip">
        {content}
      </span>
    </span>
  );
}
