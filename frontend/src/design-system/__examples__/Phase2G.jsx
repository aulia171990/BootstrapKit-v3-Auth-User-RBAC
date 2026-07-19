import React from 'react';
import {
  MapContainer, MapLayout, DriverMarker, CustomerMarker, TripPolyline, HeatmapInterface,
  LocationPin, LocationPicker, ZoomControls, Compass, CurrentLocationButton,
  FloatingMapControls, RoutePreview,
} from '../index.js';

export const MapExamples = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <MapContainer height={360}>
      <DriverMarker position={[30, 40]} label="Driver A" active pulse />
      <CustomerMarker position={[65, 55]} label="Rider B" />
      <TripPolyline points={[[30, 40], [50, 48], [65, 55]]} />
      <HeatmapInterface points={[{ x: 60, y: 30, weight: 0.9 }, { x: 25, y: 70, weight: 0.6 }]} />
      <FloatingMapControls position="tr">
        <ZoomControls onZoomIn={() => {}} onZoomOut={() => {}} />
      </FloatingMapControls>
      <FloatingMapControls position="br">
        <Compass heading={45} onClick={() => {}} />
        <CurrentLocationButton onClick={() => {}} />
      </FloatingMapControls>
    </MapContainer>

    <MapLayout
      panel={<div style={{ padding: 12 }}>Driver list panel</div>}
      panelTitle="Nearby drivers"
    >
      <MapContainer height={300}>
        <DriverMarker position={[40, 50]} label="D1" />
      </MapContainer>
    </MapLayout>

    <RoutePreview title="Trip to Airport" stats={[{ label: 'Distance', value: '12 km' }, { label: 'ETA', value: '18 min' }, { label: 'Fare', value: '$6' }]} points={[[10, 80], [90, 20]]} />

    <LocationPicker results={[{ id: 1, title: 'Home', subtitle: 'Jl. Merdeka 1' }, { id: 2, title: 'Office', subtitle: 'Tower B' }]} value={1} onSelect={() => {}} />
  </div>
);

export default MapExamples;
