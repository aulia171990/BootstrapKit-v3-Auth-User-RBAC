import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import {
  MapContainer, DriverMarker, CustomerMarker, TripPolyline, HeatmapInterface,
  LocationPin, LocationPicker, ZoomControls, Compass, CurrentLocationButton,
  FloatingMapControls, RoutePreview,
} from '../index.js';

describe('Map UI components (2G)', () => {
  it('MapContainer renders placeholder and accepts children', () => {
    const { container } = render(<MapContainer placeholder="Loading map" />);
    expect(screen.getByText('Loading map')).toBeInTheDocument();
    expect(container.querySelector('.ds-map')).toBeTruthy();
    const { container: c2 } = render(<MapContainer><div className="my-map" /></MapContainer>);
    expect(c2.querySelector('.my-map')).toBeTruthy();
  });
  it('DriverMarker positions and fires click', () => {
    const onClick = vi.fn();
    render(<MapContainer><DriverMarker position={[20, 30]} label="D1" active onClick={onClick} /></MapContainer>);
    const m = screen.getByLabelText('D1');
    expect(m.style.left).toBe('20%');
    fireEvent.click(m);
    expect(onClick).toHaveBeenCalled();
  });
  it('CustomerMarker renders', () => {
    const { container } = render(<MapContainer><CustomerMarker position={[40, 50]} label="C1" /></MapContainer>);
    expect(screen.getByLabelText('C1')).toBeTruthy();
    expect(container.querySelector('.ds-marker--customer')).toBeTruthy();
  });
  it('TripPolyline draws a path from points', () => {
    const { container } = render(<MapContainer><TripPolyline points={[[10, 10], [50, 60], [90, 40]]} /></MapContainer>);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')).toContain('M 10 10');
  });
  it('TripPolyline renders nothing with <2 points', () => {
    const { container } = render(<MapContainer><TripPolyline points={[[10, 10]]} /></MapContainer>);
    expect(container.querySelector('path')).toBeNull();
  });
  it('HeatmapInterface renders blobs', () => {
    const { container } = render(<MapContainer><HeatmapInterface points={[{ x: 20, y: 30, weight: 0.8 }]} /></MapContainer>);
    expect(container.querySelectorAll('circle').length).toBe(1);
  });
  it('LocationPin reflects active state and selects', () => {
    const onSelect = vi.fn();
    render(<LocationPin title="Home" subtitle="Jl. A" active onClick={() => onSelect('home')} />);
    const btn = screen.getByRole('button', { name: /Home/ });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('home');
  });
  it('LocationPicker lists results and reports selection', () => {
    const onSelect = vi.fn();
    render(<LocationPicker results={[{ id: 1, title: 'A' }, { id: 2, title: 'B' }]} value={2} onSelect={onSelect} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    const b = screen.getByRole('option', { name: /B/ });
    expect(b).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(b);
    expect(onSelect).toHaveBeenCalledWith(2, expect.objectContaining({ id: 2 }));
  });
  it('ZoomControls fires in/out', () => {
    const zin = vi.fn(), zout = vi.fn();
    render(<MapContainer><ZoomControls onZoomIn={zin} onZoomOut={zout} /></MapContainer>);
    fireEvent.click(screen.getByLabelText('Zoom in'));
    fireEvent.click(screen.getByLabelText('Zoom out'));
    expect(zin).toHaveBeenCalled();
    expect(zout).toHaveBeenCalled();
  });
  it('Compass rotates with heading', () => {
    const { container } = render(<MapContainer><Compass heading={90} /></MapContainer>);
    expect(screen.getByLabelText('Compass').style.transform).toContain('rotate(-90deg)');
    expect(container.querySelector('.ds-map-button')).toBeTruthy();
  });
  it('CurrentLocationButton toggles active and fires', () => {
    const onClick = vi.fn();
    render(<MapContainer><CurrentLocationButton active onClick={onClick} /></MapContainer>);
    const btn = screen.getByLabelText('My location');
    expect(btn).toHaveClass('ds-map-button--active');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
  it('FloatingMapControls groups children at a corner', () => {
    const { container } = render(<MapContainer><FloatingMapControls position="bl"><button>1</button><button>2</button></FloatingMapControls></MapContainer>);
    const f = container.querySelector('.ds-map-ctrl--bl.ds-map-floating');
    expect(f).toBeTruthy();
    expect(f.querySelectorAll('button').length).toBe(2);
  });
  it('RoutePreview shows stats and polyline', () => {
    const { container } = render(<RoutePreview title="Trip" stats={[{ label: 'Dist', value: '5 km' }, { label: 'Fare', value: '$3' }]} points={[[10, 10], [90, 90]]} />);
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('5 km')).toBeInTheDocument();
    expect(container.querySelector('path')).toBeTruthy();
  });
});
