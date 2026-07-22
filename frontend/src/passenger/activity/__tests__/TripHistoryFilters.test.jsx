import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripHistory from '../TripHistory.jsx';
import * as papi from '../../api.js';

describe('TripHistory advanced filters (5F)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // isolated localStorage for saved filters / recent searches
    const store = {};
    global.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; },
    };
  });

  it('opens filter panel and applies a driver filter', async () => {
    const spy = vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false, source: 'demo' });
    render(<TripHistory onBack={() => {}} onTripDetail={() => {}} onFavoriteTrip={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Buka filter & urutkan' }));
    const driverField = await screen.findByLabelText('Cari nama driver');
    fireEvent.change(driverField, { target: { value: 'Anto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ driver: 'Anto' })));
  });

  it('applies fare range filter', async () => {
    const spy = vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false, source: 'demo' });
    render(<TripHistory onBack={() => {}} onTripDetail={() => {}} onFavoriteTrip={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Buka filter & urutkan' }));
    fireEvent.change(screen.getByLabelText('Tarif minimum'), { target: { value: '10000' } });
    const maxInput = await screen.findByLabelText('Tarif maksimum');
    fireEvent.change(maxInput, { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    await waitFor(() => {
      const call = spy.mock.calls.find((c) => String(c[0].fareMin) === '10000' && String(c[0].fareMax) === '50000');
      expect(call).toBeTruthy();
    });
  });

  it('applies promo filter (Pakai Promo)', async () => {
    const spy = vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false, source: 'demo' });
    render(<TripHistory onBack={() => {}} onTripDetail={() => {}} onFavoriteTrip={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Buka filter & urutkan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pakai Promo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ promoUsed: 'yes' })));
  });

  it('saves and re-applies a saved filter', async () => {
    const spy = vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false, source: 'demo' });
    render(<TripHistory onBack={() => {}} onTripDetail={() => {}} onFavoriteTrip={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Buka filter & urutkan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' })); // status filter
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'completed' })));
    // Saved filter chip appears.
    expect(await screen.findByText(/Selesai|Filter/)).toBeTruthy();
  });

  it('shows recent searches after a keyword query', async () => {
    const spy = vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false, source: 'demo' });
    render(<TripHistory onBack={() => {}} onTripDetail={() => {}} onFavoriteTrip={() => {}} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'Kantor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka filter & urutkan' }));
    await waitFor(() => expect(screen.getByText('Pencarian terakhir')).toBeTruthy());
    expect(screen.getByText('Kantor')).toBeTruthy();
  });
});
