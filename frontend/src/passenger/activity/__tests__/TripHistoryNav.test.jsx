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

describe('TripHistory — navigation', () => {
  it('navigates back when back button tapped', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip()]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory onBack={onBack} />);
    const back = await screen.findByRole('button', { name: 'Kembali' });
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalled();
  });

  it('navigates to trip detail when a trip is tapped', async () => {
    const onTripDetail = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip({ id: 'z9' })]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory onTripDetail={onTripDetail} />);
    const row = await screen.findByRole('button', { name: /Perjalanan Rumah ke Kantor, Selesai/ });
    fireEvent.click(row);
    expect(onTripDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'z9' }));
  });

  it('navigates to favorite re-book', async () => {
    const onFavoriteTrip = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([{ id: 'fav1', title: 'Rumah → Kantor', count: 3 }]);
    render(<TripHistory onFavoriteTrip={onFavoriteTrip} />);
    const btn = await screen.findByRole('button', { name: /Pesan ulang Rumah → Kantor/ });
    fireEvent.click(btn);
    expect(onFavoriteTrip).toHaveBeenCalledWith(expect.objectContaining({ id: 'fav1' }));
  });
});

describe('TripHistory — filter & sort', () => {
  it('opens filter panel and applies a status filter', async () => {
    const pageMock = vi.spyOn(papi, 'fetchTripsPage');
    pageMock.mockResolvedValue(pageOf([trip(), trip({ id: 'b', status: 'cancelled', statusLabel: 'Dibatalkan', driverName: null })]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<TripHistory />);
    await waitFor(() => expect(screen.getByText('Riwayat Perjalanan')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Buka filter & urutkan' }));
    expect(screen.getByRole('group', { name: 'Status' })).toBeTruthy();
    fireEvent.click(within(screen.getByRole('group', { name: 'Status' })).getByRole('button', { name: 'Dibatalkan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    // Filter re-fetches with status=cancelled.
    await waitFor(() => {
      const call = pageMock.mock.calls.find((c) => c[0].status === 'cancelled');
      expect(call).toBeTruthy();
    });
  });

  it('changes sort and re-fetches', async () => {
    const pageMock = vi.spyOn(papi, 'fetchTripsPage');
    pageMock.mockResolvedValue(pageOf([trip()]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<TripHistory />);
    await waitFor(() => expect(screen.getByText('Riwayat Perjalanan')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Buka filter & urutkan' }));
    fireEvent.change(screen.getByLabelText('Urutkan berdasarkan'), { target: { value: 'fare_desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));

    await waitFor(() => {
      const call = pageMock.mock.calls.find((c) => c[0].sort === 'fare_desc');
      expect(call).toBeTruthy();
    });
  });

  it('searches by driver name', async () => {
    const pageMock = vi.spyOn(papi, 'fetchTripsPage');
    pageMock.mockResolvedValue(pageOf([trip(), trip({ id: 'b', driverName: 'Budi' })]));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<TripHistory />);
    await waitFor(() => expect(screen.getByText('Riwayat Perjalanan')).toBeTruthy());
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'Budi' } });
    await waitFor(() => {
      const call = pageMock.mock.calls.find((c) => c[0].keywords === 'Budi');
      expect(call).toBeTruthy();
    });
  });
});
