import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripDetail from '../TripDetail.jsx';
import * as papi from '../../api.js';

const trip = (o = {}) => ({
  id: 't1', code: 'TRP-1', date: new Date().toISOString(),
  pickup: 'Rumah', destination: 'Kantor', fare: 18500, currency: 'IDR',
  status: 'completed', statusLabel: 'Selesai', statusTone: 'success',
  vehicle: 'Motor', driverName: 'Anto', driverPhoto: null, rating: null, ongoing: false,
  paymentMethod: 'Wallet',
  raw: { promo_code: 'HALO50' },
  ...o,
});

beforeEach(() => { vi.restoreAllMocks(); });

describe('TripDetail — component', () => {
  it('renders pickup, destination, driver, fare, payment', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 8.4, durationMin: 22, fare: 38500, currency: 'IDR', points: [[0, 0]] });
    render(<TripDetail trip={trip()} />);
    expect(await screen.findByText('Detail Perjalanan')).toBeTruthy();
    expect(screen.getAllByText('Rumah').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Kantor').length).toBeGreaterThan(0);
    expect(screen.getByText('Anto')).toBeTruthy();
    expect(screen.getAllByText('Rp 18.500', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText('Pembayaran')).toBeTruthy();
    // Route distance/duration shown.
    expect(screen.getAllByText('8.4 km').length).toBeGreaterThan(0);
    expect(screen.getAllByText('22 mnt').length).toBeGreaterThan(0);
  });

  it('shows loading skeleton then content', async () => {
    vi.spyOn(papi, 'getTripDetail').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={null} id="t1" />);
    expect(screen.getByText('Detail Perjalanan')).toBeTruthy();
    expect(screen.queryByText('Rumah')).toBeNull();
  });

  it('shows error state with retry', async () => {
    const onRetry = vi.fn();
    vi.spyOn(papi, 'getTripDetail').mockRejectedValue(new Error('boom'));
    render(<TripDetail trip={null} id="t1" onRetry={onRetry} />);
    expect(await screen.findByText('Gagal memuat detail')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows not-found when no trip', async () => {
    vi.spyOn(papi, 'getTripDetail').mockResolvedValue(null);
    render(<TripDetail trip={null} id="missing" />);
    expect(await screen.findByText('Perjalanan tidak ditemukan')).toBeTruthy();
  });

  it('does not offer rating for non-completed trips', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip({ status: 'cancelled', statusLabel: 'Dibatalkan', statusTone: 'danger' })} />);
    expect(await screen.findByText(/Penilaian tersedia setelah/)).toBeTruthy();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
});

describe('TripDetail — rating & actions', () => {
  it('lets a passenger rate a completed trip', async () => {
    const submit = vi.spyOn(papi, 'submitTripRating').mockResolvedValue({ id: 't1', rating: 5, status: 'saved' });
    const onRate = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip({ rating: null })} onRate={onRate} />);

    const group = await screen.findByRole('radiogroup', { name: 'Beri nilai' });
    fireEvent.click(within(group).getByRole('radio', { name: 'Nilai 5' }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith('t1', 5));
    expect(onRate).toHaveBeenCalledWith('t1', 5);
  });

  it('shows existing rating without input', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip({ rating: 5 })} />);
    expect(await screen.findByText(/Terima kasih atas penilaian/)).toBeTruthy();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('triggers repeat booking', async () => {
    const onRepeat = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip()} onRepeatBooking={onRepeat} />);
    fireEvent.click(await screen.findByRole('button', { name: /Pesan Lagi/ }));
    expect(onRepeat).toHaveBeenCalled();
  });

  it('triggers support shortcut (chat)', async () => {
    const onSupport = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip()} onSupport={onSupport} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Aksi Lainnya' }));
    const sheet = await screen.findByRole('dialog', { name: 'Aksi Perjalanan' });
    fireEvent.click(within(sheet).getByRole('button', { name: /Chat Bantuan/ }));
    expect(onSupport).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }), 'chat');
  });

  it('navigates back', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, points: [] });
    render(<TripDetail trip={trip()} onBack={onBack} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Kembali' }));
    expect(onBack).toHaveBeenCalled();
  });
});
