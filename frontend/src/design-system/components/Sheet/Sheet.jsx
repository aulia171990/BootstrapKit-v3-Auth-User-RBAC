import React from 'react';
import Drawer from '../Drawer/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Sheet — bottom (default) or side sliding panel for mobile/quick actions.
 * Thin wrapper over Drawer with a contextual default placement.
 * @param {boolean} open
 * @param {function} onClose
 * @param {'left'|'right'|'top'|'bottom'} side default 'bottom'
 */
export default function Sheet({ open, onClose, side = 'bottom', title, footer, width, children, className, ...rest }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side={side}
      title={title}
      footer={footer}
      width={width}
      className={cx('ds-sheet', className)}
      {...rest}
    >
      {children}
    </Drawer>
  );
}
