import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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

describe('Activity UX polish (5H)', () => {
  it('marks the list busy (aria-busy) while loading', () => {
    vi.spyOn(papi, 'fetchTripsPage').mockReturnValue(new Promise(() => {}));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    const { container } = render(<TripHistory />);
    const main = container.querySelector('main.pasv-th__body');
    expect(main).toBeTruthy();
    expect(main.getAttribute('aria-busy')).toBe('true');
  });

  it('clears aria-busy once loaded', async () => {
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip()], { hasMore: false }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    const { container } = render(<TripHistory />);
    await screen.findByRole('heading', { level: 2 });
    await waitFor(() => {
      const main = container.querySelector('main.pasv-th__body');
      expect(main.getAttribute('aria-busy')).toBe('false');
    });
  });

  it('renders memoized trip rows with accessible labels', async () => {
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip()], { hasMore: false }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory />);
    expect(await screen.findByRole('button', { name: /Perjalanan Rumah ke Kantor/ })).toBeTruthy();
  });

  it('shows offline state with a retry that reloads', async () => {
    const reload = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory onRetry={reload} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Coba lagi' }));
    expect(reload).toHaveBeenCalled();
  });

  it('CSS ships reduced-motion + focus-visible guards', () => {
    const dir = path.resolve(__dirname, '..');
    for (const f of ['activity.css', 'tripHistory.css', 'refundSupport.css']) {
      const css = fs.readFileSync(path.join(dir, f), 'utf8');
      expect(css).toContain('prefers-reduced-motion');
      expect(css).toContain(':focus-visible');
      expect(css).toContain('@keyframes');
    }
  });
});
