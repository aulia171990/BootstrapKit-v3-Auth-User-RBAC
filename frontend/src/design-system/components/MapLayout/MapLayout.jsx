import React from 'react';
import { cx } from '../_util.js';
import '../../components/__layout.css';

/**
 * MapLayout — full-screen map with an overlaid side panel (left/right).
 * @param {ReactNode} map the map element (fills background)
 * @param {ReactNode} panel side panel content @param {'left'|'right'} panelSide
 * @param {string} panelTitle
 */
export default function MapLayout({ map, panel, panelSide = 'left', panelTitle, className, ...rest }) {
  return (
    <div className={cx('ds-map-layout', className)} {...rest}>
      <div className="ds-map-layout__map">{map}</div>
      {panel && (
        <aside className="ds-map-layout__panel" data-side={panelSide}>
          {panelTitle && <div className="ds-map-layout__panel-header">{panelTitle}</div>}
          <div className="ds-map-layout__panel-body">{panel}</div>
        </aside>
      )}
    </div>
  );
}
