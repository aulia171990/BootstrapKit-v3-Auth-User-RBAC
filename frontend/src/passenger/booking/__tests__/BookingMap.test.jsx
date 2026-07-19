import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import BookingMap from '../BookingMap/BookingMap.jsx';
import * as papi from '../../api.js';

const pickup = { address: 'Jl. Merdeka No. 12', coord: { lat: -6.2, lng: 106.816 } };
const destination = { title: 'Bandara Soekarno-Hatta T2', subtitle: 'Tangerang', address: 'Bandara Soekarno-Hatta T2' };

describe('BookingMap — reusable booking map interaction', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('renders map canvas, markers, polyline, route preview', async () => {
    render(<BookingMap pickup={pickup} destination={destination} />);
    expect(screen.getByLabelText(/Peta perjalanan/)).toBeInTheDocument();
    // Route resolves asynchronously → markers + route preview appear after load.
    await waitFor(() => expect(screen.getByText('Jemput')).toBeInTheDocument());
    expect(screen.getAllByText('Tujuan').length).toBeGreaterThan(0);
    // polyline svg
    expect(document.querySelector('.ds-map-svg path')).toBeTruthy();
    // route preview stats
    await waitFor(() => expect(screen.getByText('Rute perjalanan')).toBeInTheDocument());
    expect(screen.getByText('8.4 km')).toBeInTheDocument();
    expect(screen.getByText('22 mnt')).toBeInTheDocument();
    expect(screen.getByText(/Rp 38\.500/)).toBeInTheDocument();
  });

  it('zoom controls change zoom level', async () => {
    render(<BookingMap pickup={pickup} destination={destination} />);
    await waitFor(() => expect(screen.getByLabelText('Zoom in')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Zoom in'));
    expect(screen.getByText('Z 15')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Zoom out'));
    expect(screen.getByText('Z 14')).toBeInTheDocument();
  });

  it('current location button invokes handler', async () => {
    const onCurrent = vi.fn();
    render(<BookingMap pickup={pickup} destination={destination} onCurrentLocation={onCurrent} />);
    await waitFor(() => expect(screen.getByLabelText('Lokasi saat ini')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Lokasi saat ini'));
    expect(onCurrent).toHaveBeenCalled();
  });

  it('gesture drag pans the camera (transform changes)', async () => {
    render(<BookingMap pickup={pickup} destination={destination} />);
    const canvas = await screen.findByLabelText(/Peta perjalanan/);
    const before = document.querySelector('.pasv-bmap__layer').style.transform;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent(canvas, new window.MouseEvent('pointermove', { clientX: 160, clientY: 140, bubbles: true }));
    fireEvent.pointerUp(canvas, { clientX: 160, clientY: 140, pointerId: 1 });
    const after = document.querySelector('.pasv-bmap__layer').style.transform;
    expect(after).not.toBe(before);
  });

  it('bottom sheet shows pickup + destination details', async () => {
    render(<BookingMap pickup={pickup} destination={destination} />);
    await waitFor(() => expect(screen.getByText('Detail perjalanan')).toBeInTheDocument());
    const sheet = screen.getByText('Detail perjalanan').closest('.ds-sheet, [role="dialog"]') || document.body;
    expect(within(sheet).getByText('Jl. Merdeka No. 12')).toBeInTheDocument();
    expect(within(sheet).getByText('Bandara Soekarno-Hatta T2')).toBeInTheDocument();
  });

  it('custom sheetContent renders', async () => {
    render(<BookingMap pickup={pickup} destination={destination} sheetContent={<div>Pilih kendaraan di sini</div>} />);
    await waitFor(() => expect(screen.getByText('Pilih kendaraan di sini')).toBeInTheDocument());
  });

  it('a11y: labelled canvas, zoom, current-location, sheet', async () => {
    render(<BookingMap pickup={pickup} destination={destination} />);
    await waitFor(() => expect(screen.getByLabelText('Zoom in')).toBeInTheDocument());
    expect(screen.getByLabelText(/Peta perjalanan/)).toBeInTheDocument();
    expect(screen.getByLabelText('Lokasi saat ini')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
  });

  it('error state when route fails', async () => {
    const spy = vi.spyOn(papi, 'getRoute').mockRejectedValueOnce(new Error('boom'));
    render(<BookingMap pickup={pickup} destination={destination} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat rute/)).toBeInTheDocument());
    spy.mockRestore();
  });
});
