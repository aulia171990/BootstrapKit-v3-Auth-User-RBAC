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

describe('ActivityHome — accessibility', () => {
  it('labels all interactive controls (search, filter, chips, rows)', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([{ id: 'f1', title: 'Rumah → Kantor', count: 3 }]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());

    // Search input has an accessible name.
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
    // Filter toggle exposes expanded state.
    const filterBtn = screen.getByRole('button', { name: 'Buka filter' });
    expect(filterBtn).toHaveAttribute('aria-expanded', 'false');
    // Chip groups are labelled.
    expect(screen.getByRole('group', { name: 'Status' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Kendaraan' })).toBeTruthy();
    // Section landmarks.
    expect(screen.getByRole('region', { name: 'Perjalanan terbaru' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Pembayaran terbaru' })).toBeTruthy();
  });

  it('reflects pressed state on active filter chips', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());

    const statusGroup = screen.getByRole('group', { name: 'Status' });
    const completedChip = within(statusGroup).getByRole('button', { name: 'Selesai' });
    fireEvent.click(completedChip);
    expect(completedChip).toHaveAttribute('aria-pressed', 'true');
    const allChip = within(statusGroup).getByRole('button', { name: 'Semua' });
    expect(allChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('announces the offline state via a status region', async () => {
    // Simulate offline before render.
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Mode Offline')).toBeTruthy());
    expect(screen.getByRole('status')).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });

  it('marks trip rows with descriptive aria-labels including route and status', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip({ pickup: 'Rumah', destination: 'Kantor' })]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    render(<ActivityHome />);
    const row = await screen.findByRole('button', { name: /Perjalanan Rumah ke Kantor, Selesai/ });
    expect(row).toBeTruthy();
  });

  it('keeps the section heading structure (one h1, labelled regions)', async () => {
    vi.spyOn(papi, 'fetchRecentTrips').mockResolvedValue([trip()]);
    vi.spyOn(papi, 'getOngoingTrip').mockResolvedValue(null);
    vi.spyOn(papi, 'getRecentPayments').mockResolvedValue([pay()]);
    vi.spyOn(papi, 'getFavoriteTrips').mockResolvedValue([]);

    const { container } = render(<ActivityHome />);
    await waitFor(() => expect(screen.getByText('Perjalanan Terbaru')).toBeTruthy());
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toBe('Aktivitas');
  });
});
