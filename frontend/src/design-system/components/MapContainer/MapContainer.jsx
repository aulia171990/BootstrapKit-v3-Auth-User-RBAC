import React from 'react';
import { MapPin } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';
import '../_maps/_maps.css';

/**
 * MapContainer — themed shell for map libraries (Mapbox, Leaflet, Google).
 * Renders a placeholder when no map node is supplied; drop your map component as children.
 * @param {ReactNode} children map element (optional)
 * @param {number|string} height
 */
export default function MapContainer({ children, height, placeholder = 'Map', className, ...rest }) {
  return (
    <div className={cx('ds-map', className)} style={height ? { '--ds-map-h': height } : undefined} {...rest}>
      {children ?? (
        <div className="ds-map__placeholder">
          <Icon icon={MapPin} size="lg" />
          <span style={{ marginLeft: 'var(--ds-space-2)' }}>{placeholder}</span>
        </div>
      )}
    </div>
  );
}
