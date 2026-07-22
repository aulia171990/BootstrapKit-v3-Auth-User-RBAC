import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityHome from '../ActivityHome.jsx';
import * as papi from '../../api.js';

const trip = (o = {}) => ({
  id: 't1', code: 'TRP-1', date: new Date().toISOString(),
  pickup: 'Rumah', destination: 'Kantor', fare: 18500, currency: 'IDR',
  status: 'completed', statusLabel: 'Selesai', statusTone: 'success',
  vehicle: 'Motor', driverName: 'Anto', driverPhoto: null, rating: 5, ongoing: false, raw: {},
  ...o,
});
const pay = (o = {}) => ({
  id: 'p1', title: 'Trip · Rumah → Kantor', amount: -18500, currency: 'IDR',
  status: 'completed', at: new Date().toISOString(), type: 'trip', method: 'Wallet',
  ...o,
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('ActivityHome — component', () => {
  it('renders loading skeletons then content', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([{ id: 'f1', title: 'Rumah → Kantor', count: 3 }]);

    render(<ActivityHome />);
    expect(screen.getByText('Aktivitas')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());
    expect(screen.getByText('Pembayaran Terbaru')).toBeTruthy();
    expect(screen.getByText('Favorit')).toBeTruthy();
  });

  it('shows recent trip with pickup, destination, fare, status, driver, rating', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip({ driverName: 'Budi', rating: 4, fare: 16500 })]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    const row = await screen.findByRole('button', { name: /Perjalanan Rumah ke Kantor, Selesai/ });
    expect(within(row).getByText(/Budi/)).toBeTruthy();
    expect(within(row).getByText('Selesai')).toBeTruthy();
    expect(within(row).getByText('Rp 16.500', { exact: false })).toBeTruthy();
  });

  it('shows ongoing trip summary card when an active trip exists', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(trip({ status: 'in_progress', statusLabel: 'Berjalan', ongoing: true, pickup: 'Rumah', destination: 'Mall' }));
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    expect(await screen.findByText('Perjalanan Berlangsung')).toBeTruthy();
    expect(screen.getByText('Rumah → Mall')).toBeTruthy();
  });

  it('filters trips by status chip', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([
      trip({ id: 'a', status: 'completed', statusLabel: 'Selesai', driverName: 'Anto', pickup: 'Rumah', destination: 'Kantor' }),
      trip({ id: 'b', status: 'cancelled', statusLabel: 'Dibatalkan', driverName: null, pickup: 'Mall', destination: 'Rumah' }),
    ]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getAllByText('Selesai', { selector: '.ds-badge' }).length).toBeGreaterThan(0));
    // Click the "Dibatalkan" status chip → only the cancelled trip remains.
    fireEvent.click(screen.getByRole('button', { name: 'Dibatalkan' }));
    // Completed driver "Anto" must be gone; cancelled trip (no driver) remains with "Mall".
    expect(screen.queryByText(/Anto/)).toBeNull();
    expect(screen.getByText('Mall', { exact: false })).toBeTruthy();
  });

  it('searches by driver name and pickup', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([
      trip({ id: 'a', pickup: 'Rumah', destination: 'Kantor', driverName: 'Anto' }),
      trip({ id: 'b', pickup: 'Mall', destination: 'Rumah', driverName: 'Budi' }),
    ]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Kantor', { exact: false })).toBeTruthy());
    const input = screen.getByRole('searchbox', { name: 'Search' });
    fireEvent.change(input, { target: { value: 'Budi' } });
    expect(screen.getAllByText('Rumah', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Kantor', { exact: false })).toBeNull();
  });

  it('opens and applies the date-range filter panel', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Buka filter' }));
    expect(screen.getByLabelText('Tanggal dari')).toBeTruthy();
    expect(screen.getByLabelText('Tanggal sampai')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  });

  it('shows empty state when no trips or payments', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    expect(await screen.findByText('Belum ada perjalanan')).toBeTruthy();
    expect(screen.getByText('Belum ada pembayaran')).toBeTruthy();
  });

  it('shows error state and allows retry', async () => {
    const reload = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getOngoingTrip').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getRecentPayments').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getFavoriteTrips').mockRejectedValue(new Error('boom'));

    render(<ActivityHome onRetry={reload} />);
    expect(await screen.findByText('Gagal memuat aktivitas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(reload).toHaveBeenCalled();
  });
});
