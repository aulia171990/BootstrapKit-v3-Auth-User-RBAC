import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TripCompleted from '../TripCompleted.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const a = await vi.importActual('../../api.js');
  return { ...a, getTripSummary: vi.fn() };
});

const driver = { id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg', vehicle: 'Honda Vario 150', plate: 'B 1234 ANT' };
const booking = { id: 'BKD1' };

beforeEach(() => {
  papi.getTripSummary.mockResolvedValue({
    bookingId: 'BKD1', fare: 38500, currency: 'IDR', distanceKm: 8.4, durationMin: 22, paymentStatus: 'paid', paymentMethod: 'Wallet', vehicle: 'Mobil', rating: null,
  });
});

describe('TripCompleted (3C-3G)', () => {
  it('shows success, fare, distance, duration, payment status', async () => {
    render(<TripCompleted booking={booking} driver={driver} onReceipt={vi.fn()} onHome={vi.fn()} />);
    expect(screen.getByLabelText('Perjalanan selesai')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Rp 38\.500/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('8.4 km')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('22 mnt')).toBeInTheDocument());
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });

  it('rates the driver and calls onRate', async () => {
    const onRate = vi.fn();
    render(<TripCompleted booking={booking} driver={driver} onRate={onRate} onReceipt={vi.fn()} onHome={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('5 bintang'));
    await waitFor(() => expect(onRate).toHaveBeenCalledWith(booking, driver, 5));
    expect(screen.getByText(/Terima kasih atas penilaiannya/)).toBeInTheDocument();
  });

  it('navigates to receipt on Lihat Receipt', async () => {
    const onReceipt = vi.fn();
    render(<TripCompleted booking={booking} driver={driver} onReceipt={onReceipt} onHome={vi.fn()} />);
    fireEvent.click(screen.getByText('Lihat Receipt'));
    expect(onReceipt).toHaveBeenCalledWith(booking, driver);
  });
});
