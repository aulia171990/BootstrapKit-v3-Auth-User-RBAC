import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripHistory from '../TripHistory.jsx';
import * as papi from '../../api.js';

const trip = (o = {}) => ({
  id: 't1', code: 'TRP-1', date: new Date().toISOString(),
  pickup: 'Rumah', destination: 'Kantor', fare: 18500, currency: 'IDR',
  status: 'completed', statusLabel: 'Selesai', statusTone: 'success',
  vehicle: 'Motor', driverName: 'Anto', driverPhoto: null, rating: 5, ongoing: false, raw: {},
  ...o,
});

const pageOf = (arr, opts = {}) => ({
  items: arr, page: opts.page || 1, pageSize: 8, total: opts.total ?? arr.length,
  hasMore: opts.hasMore ?? false, source: opts.source || 'demo',
});

beforeEach(() => { vi.restoreAllMocks(); });

describe('TripHistory — component', () => {
  it('renders grouped-by-month trip history', async () => {
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip()], { hasMore: false }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([{ id: 'f1', title: 'Rumah → Kantor', count: 3 }]);

    render(<TripHistory />);
    expect(await screen.findByText('Riwayat Perjalanan')).toBeTruthy();
    // Month grouping header present.
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
    expect(screen.getAllByText('Rumah', { exact: false }).length).toBeGreaterThan(0);
  });

  it('shows loading skeleton on initial load', () => {
    vi.spyOn(papi, 'fetchTripsPage').mockReturnValue(new Promise(() => {}));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory />);
    expect(screen.getByText('Riwayat Perjalanan')).toBeTruthy();
    // No trip rows yet (loading).
    expect(screen.queryByText('Rumah', { exact: false })).toBeNull();
  });

  it('shows empty state when no trips', async () => {
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([], { hasMore: false }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory />);
    expect(await screen.findByText('Belum ada perjalanan')).toBeTruthy();
  });

  it('shows error state and allows retry', async () => {
    const reload = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory onRetry={reload} />);
    expect(await screen.findByText('Gagal memuat riwayat')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(reload).toHaveBeenCalled();
  });

  it('loads more pages when sentinel intersects (infinite scroll)', async () => {
    const pageMock = vi.spyOn(papi, 'fetchTripsPage');
    pageMock.mockResolvedValueOnce(pageOf([trip({ id: 'a' })], { hasMore: true, total: 16 }));
    pageMock.mockResolvedValueOnce(pageOf([trip({ id: 'b' })], { hasMore: false, total: 16 }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    // jsdom lacks IntersectionObserver; polyfill to trigger immediately.
    global.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() { this.cb([{ isIntersecting: true }]); }
      disconnect() {}
    };

    render(<TripHistory />);
    await waitFor(() => expect(screen.getByText('Rumah', { exact: false })).toBeTruthy());
    // Second page loads via sentinel → both trip rows present.
    await waitFor(() => expect(screen.getAllByText('Rumah', { exact: false }).length).toBeGreaterThan(1));
    expect(pageMock).toHaveBeenCalledTimes(2);
  });
});
