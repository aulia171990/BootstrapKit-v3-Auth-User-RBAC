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

beforeEach(() => { vi.restoreAllMocks(); });

describe('ActivityHome — navigation', () => {
  it('navigates to trip detail when a recent trip is tapped', async () => {
    const onTripDetail = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip({ id: 'z9' })]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome onTripDetail={onTripDetail} />);
    const btn = await screen.findByRole('button', { name: /Perjalanan Rumah ke Kantor/ });
    fireEvent.click(btn);
    expect(onTripDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'z9' }));
  });

  it('navigates to payment detail when a payment row is tapped', async () => {
    const onPaymentDetail = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay({ id: 'pp' })]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome onPaymentDetail={onPaymentDetail} />);
    const btn = await screen.findByRole('button', { name: /Pembayaran Trip · Rumah/ });
    fireEvent.click(btn);
    expect(onPaymentDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'pp' }));
  });

  it('navigates to favorite re-book when a favorite is tapped', async () => {
    const onFavoriteTrip = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([{ id: 'fav1', title: 'Rumah → Kantor', count: 3 }]);

    render(<ActivityHome onFavoriteTrip={onFavoriteTrip} />);
    const btn = await screen.findByRole('button', { name: /Pesan ulang Rumah → Kantor/ });
    fireEvent.click(btn);
    expect(onFavoriteTrip).toHaveBeenCalledWith(expect.objectContaining({ id: 'fav1' }));
  });

  it('navigates to view-all trips and view-all payments', async () => {
    const onViewAllTrips = vi.fn();
    const onViewAllPayments = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome onViewAllTrips={onViewAllTrips} onViewAllPayments={onViewAllPayments} />);
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());
    const viewAllBtns = screen.getAllByRole('button', { name: 'Lihat Semua' });
    fireEvent.click(viewAllBtns[0]);
    fireEvent.click(viewAllBtns[1]);
    expect(onViewAllTrips).toHaveBeenCalled();
    expect(onViewAllPayments).toHaveBeenCalled();
  });

  it('navigates to ongoing trip when tapped', async () => {
    const onOngoingTrip = vi.fn();
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(trip({ status: 'in_progress', statusLabel: 'Berjalan', ongoing: true, pickup: 'Rumah', destination: 'Mall' }));
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome onOngoingTrip={onOngoingTrip} />);
    const btn = await screen.findByRole('button', { name: /Rumah → Mall/ });
    fireEvent.click(btn);
    expect(onOngoingTrip).toHaveBeenCalled();
  });
});
