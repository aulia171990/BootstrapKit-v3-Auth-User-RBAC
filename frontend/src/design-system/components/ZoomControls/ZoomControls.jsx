import React from 'react';
import { Plus, Minus } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';

/** ZoomControls — map zoom in/out buttons. */
export default function ZoomControls({ onZoomIn, onZoomOut, disabled, className, ...rest }) {
  return (
    <div className={cx('ds-map-ctrl', 'ds-map-ctrl--tr', className)} {...rest}>
      <button type="button" className="ds-map-button" aria-label="Zoom in" onClick={onZoomIn} disabled={disabled}><Icon icon={Plus} size="sm" /></button>
      <button type="button" className="ds-map-button" aria-label="Zoom out" onClick={onZoomOut} disabled={disabled}><Icon icon={Minus} size="sm" /></button>
    </div>
  );
}
