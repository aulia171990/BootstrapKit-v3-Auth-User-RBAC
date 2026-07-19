import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingReview from '../BookingReview.jsx';
import * as papi from '../../api.js';
import { estimateFare, getVehicle } from '../pricingEngine.js';

vi.mock('../../api.js', () => ({
  createBooking: vi.fn(),
  getBooking: vi.fn(),
}));

const car = getVehicle('car');
const route = { distanceKm: 8.4, durationMin: 22 };
const fare = estimateFare(car, route, { surgeMultiplier: 1 });
const payload = {
  pickup: { address: 'Jl. Merdeka 12' },
  destination: { title: 'Kantor' },
  vehicle: car, fare, route, surge: { multiplier: 1, level: 'Normal' },
  promo: { id: 'p1', title: 'Diskon 50%', code: 'HALO50' }, method: 'wallet',
};

beforeEach(() => {
  papi.createBooking.mockResolvedValue({ id: 'BKTEST1', status: 'waiting_driver', vehicle: 'car' });
});

describe('BookingReview (3B-2G)', () => {
  it('renders the full booking summary', () => {
    render(<BookingReview payload={payload} onBack={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('Jl. Merdeka 12')).toBeInTheDocument();
    expect(screen.getByText('Kantor')).toBeInTheDocument();
    expect(screen.getByText('Mobil')).toBeInTheDocument();
    expect(screen.getByText(/Diskon 50%/)).toBeInTheDocument();
    expect(screen.getByText('Dompet Ojol')).toBeInTheDocument();
    expect(screen.getByText(/Konfirmasi Pesanan/)).toBeInTheDocument();
  });

  it('requires terms agreement before confirming', () => {
    render(<BookingReview payload={payload} onBack={vi.fn()} onSuccess={vi.fn()} />);
    const btn = screen.getByText(/Konfirmasi Pesanan/);
    expect(btn.closest('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(btn.closest('button')).not.toBeDisabled();
  });

  it('confirms booking and navigates to Trip Waiting on success', async () => {
    const onSuccess = vi.fn();
    render(<BookingReview payload={payload} onBack={vi.fn()} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Konfirmasi Pesanan/));
    // Loading then success
    await waitFor(() => expect(screen.getByText('Pesanan dibuat')).toBeInTheDocument());
    expect(onSuccess).toHaveBeenCalled();
    expect(onSuccess.mock.calls[0][0].id).toBe('BKTEST1');
  });

  it('shows failure state and keeps confirm available', async () => {
    papi.createBooking.mockRejectedValueOnce(new Error('Network gagal'));
    const onSuccess = vi.fn();
    render(<BookingReview payload={payload} onBack={vi.fn()} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Konfirmasi Pesanan/));
    await waitFor(() => expect(screen.getByText(/Network gagal/)).toBeInTheDocument());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
