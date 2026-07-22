import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripHistory from '../TripHistory.jsx';
import TripDetail from '../TripDetail.jsx';
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

describe('Activity UI recs (Uber-style)', () => {
  it('TripHistory shows quick Receipt + Pesan Lagi actions per card', async () => {
    const onReceipt = vi.fn();
    const onRepeat = vi.fn();
    vi.spyOn(papi, 'fetchTripsPage').mockResolvedValue(pageOf([trip()], { hasMore: false }));
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);
    render(<TripHistory onReceipt={onReceipt} onRepeat={onRepeat} />);
    const receiptBtn = await screen.findByRole('button', { name: /Lihat receipt perjalanan/ });
    const repeatBtn = screen.getByRole('button', { name: /Pesan lagi perjalanan/ });
    fireEvent.click(receiptBtn);
    expect(onReceipt).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
    fireEvent.click(repeatBtn);
    expect(onRepeat).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('TripDetail opens a bottom sheet with mobile actions', async () => {
    vi.spyOn(papi, 'getTripDetail').mockResolvedValue(trip());
    const onReceipt = vi.fn();
    const onSupport = vi.fn();
    render(<TripDetail trip={trip()} onReceipt={onReceipt} onSupport={onSupport} />);

    // Open sheet.
    fireEvent.click(await screen.findByRole('button', { name: 'Aksi Lainnya' }));
    const sheet = await screen.findByRole('dialog', { name: 'Aksi Perjalanan' });
    expect(sheet).toBeTruthy();

    // Receipt action inside sheet.
    fireEvent.click(within(sheet).getByRole('button', { name: /Lihat Receipt/ }));
    expect(onReceipt).toHaveBeenCalled();
  });
});
