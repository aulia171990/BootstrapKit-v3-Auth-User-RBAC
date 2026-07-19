import React from 'react';
import Divider from '../Divider/index.js';
import { cx } from '../_util.js';

/**
 * Separator — thin horizontal rule (alias of Divider with hairline defaults).
 * Use to visually separate sections; renders <hr>-like semantics.
 */
export default function Separator({ className, ...rest }) {
  return <Divider orientation="horizontal" variant="solid" className={cx('ds-separator', className)} {...rest} />;
}
