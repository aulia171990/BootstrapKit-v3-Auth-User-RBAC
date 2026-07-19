import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TripPolyline, ZoomControls, CurrentLocationButton, RoutePreview, BaseMarker, DriverMarker, Sheet, Spinner } from '../../../design-system/index.js';
import { MapPin, Navigation } from 'lucide-react';
import * as papi from '../../api.js';
import './booking-map.css';

/**
 * BookingMap — reusable booking map interaction (3B-2C).
 * Composes the Design System Maps module; no map engine required.
 *
 * Features: Route Preview, Pickup Marker, Destination Marker, Polyline,
 * Camera Animation, Zoom Controls, Current Location, Gesture Support,
 * Bottom Sheet integration.
 *
 * @param {{address?:string,coord?:{lat,lng}}} pickup
 * @param {{address?:string,title?:string,coord?:{lat,lng}}} destination
 * @param {(p:object)=>void} onCurrentLocation  current-location button pressed
 * @param {ReactNode} sheetContent             rendered inside the bottom sheet
 * @param {boolean} sheetOpen                  bottom-sheet open state
 * @param {()=>void} onSheetClose
 * @param {boolean} loading                    force the map loading state (3C-3I)
 */
export default function BookingMap({
  pickup, destination, onCurrentLocation, sheetContent, sheetOpen = true, onSheetClose,
  height = 320, className, mode = 'booking', driver, loading = false,
}) {
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState('loading');
  const [zoom, setZoom] = useState(14);
  const [camera, setCamera] = useState({ x: 0, y: 0 }); // camera offset %
  const canvasRef = useRef(null);
  const gesture = useRef(null);
  const points = route?.points;

  // Route preview
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    papi.getRoute(pickup, destination).then((r) => {
      if (cancelled) return;
      setRoute(r); setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [pickup, destination]);

  // Camera animation: recenter when pickup/destination change.
  useEffect(() => {
    // simple "fly to" easing toward a target offset (placeholder centering)
    setCamera({ x: 0, y: 0 });
  }, [pickup, destination, zoom]);

  // Live driver location: animate the driver marker.
  //  - mode "assigned"   : driver approaches the pickup point.
  //  - mode "inprogress" : driver travels along the route (pickup -> destination).
  const [driverPos, setDriverPos] = useState(null);
  useEffect(() => {
    if (!driver || !points) return undefined;
    if (mode !== 'assigned' && mode !== 'inprogress') return undefined;
    let t = 0;
    const start = mode === 'inprogress' ? points[0] : [62, 40];
    const end = mode === 'inprogress' ? points[points.length - 1] : points[0];
    const id = setInterval(() => {
      t = Math.min(1, t + 0.06);
      setDriverPos([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
      ]);
    }, 1200);
    return () => clearInterval(id);
  }, [mode, driver, points]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(20, z + 1)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(1, z - 1)), []);

  // Gesture support: drag to pan (updates camera), wheel to zoom.
  const onPointerDown = (e) => {
    gesture.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, cx: camera.x, cy: camera.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!gesture.current) return;
    const dx = (e.clientX ?? 0) - gesture.current.x;
    const dy = (e.clientY ?? 0) - gesture.current.y;
    setCamera({ x: gesture.current.cx + dx * 0.06, y: gesture.current.cy + dy * 0.06 });
  };
  const onPointerUp = (e) => { gesture.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId); };
  const onWheel = (e) => {
    setZoom((z) => Math.max(1, Math.min(20, z + (e.deltaY < 0 ? 1 : -1))));
  };

  return (
    <div className={`pasv-bmap ${className || ''}`}>
      <div
        ref={canvasRef}
        className="pasv-bmap__canvas"
        role="application"
        aria-label="Peta perjalanan — seret untuk menggeser, gulir untuk zoom"
        aria-busy={status === 'loading'}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <div className="pasv-bmap__layer" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom / 14})` }}>
          <div className="pasv-bmap__grid" />
        </div>

        {/* Map loading shimmer overlay (3C-3I: forced + route loading) */}
        {(loading || status === 'loading') && (
          <div className="pasv-bmap__loading">
            <Spinner size="md" label="Memuat peta" />
          </div>
        )}

        {/* Polyline route overlay */}
        {points && points.length > 1 && (
          <TripPolyline points={points} color="var(--ds-color-primary)" width={4} />
        )}

        {/* Pickup marker (bottom-left of route) */}
        {points && (
          <BaseMarker
            position={points[0]}
            icon={MapPin}
            tone="success"
            label="Jemput"
            pulse
            active
          />
        )}
        {/* Searching-radius ring (3C-3A waiting state) */}
        {mode === 'waiting' && points && (
          <div className="pasv-bmap__ring" aria-hidden="true" />
        )}
        {/* Destination marker (top-right of route) */}
        {points && (
          <BaseMarker
            position={points[points.length - 1]}
            icon={Navigation}
            tone="danger"
            label="Tujuan"
            active
          />
        )}
        {/* Live driver location (3C-3B / 3C-3D) */}
        {(mode === 'assigned' || mode === 'inprogress') && driverPos && (
          <DriverMarker position={driverPos} label={driver?.name || 'Driver'} pulse active moving />
        )}

        {/* Zoom + current-location controls */}
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <div className="pasv-bmap__zoom">
          <CurrentLocationButton active onClick={onCurrentLocation} aria-label="Lokasi saat ini" />
          <span className="pasv-bmap__zoomlevel">Z {zoom}</span>
        </div>
      </div>

      {/* Route status — announced politely for screen readers */}
      <div className="pasv-bmap__route" aria-live="polite" role="status">
        {status === 'loading' && (
          <div className="pasv-bmap__loading-bar" />
        )}
        {status === 'loading' && 'Memuat rute…'}
        {status === 'error' && 'Gagal memuat rute.'}
      </div>

      {/* Bottom sheet integration */}
      {status === 'ready' && route && (
        <RoutePreview
          title="Rute perjalanan"
          stats={[
            { label: 'Jarak', value: `${route.distanceKm} km` },
            { label: 'Waktu', value: `${route.durationMin} mnt` },
            { label: 'Estimasi', value: `Rp ${route.fare.toLocaleString('id-ID')}` },
          ]}
        />
      )}

      {/* Bottom sheet integration */}
      <Sheet open={sheetOpen} onClose={onSheetClose} side="bottom" title="Detail perjalanan">
        <div className="pasv-bmap__sheet">
          <div className="pasv-bmap__sheet-row">
            <span className="pasv-bmap__dot pasv-bmap__dot--pickup" />
            <div className="pasv-bmap__sheet-body">
              <div className="pasv-bmap__sheet-title">{pickup?.address || pickup?.title || 'Titik jemput'}</div>
              <div className="pasv-bmap__sheet-sub">Titik jemput</div>
            </div>
          </div>
          <div className="pasv-bmap__sheet-row">
            <span className="pasv-bmap__dot pasv-bmap__dot--dest" />
            <div className="pasv-bmap__sheet-body">
              <div className="pasv-bmap__sheet-title">{destination?.address || destination?.title || 'Tujuan'}</div>
              <div className="pasv-bmap__sheet-sub">Tujuan</div>
            </div>
          </div>
          {sheetContent}
        </div>
      </Sheet>
    </div>
  );
}
