import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DriverArriving from '../DriverArriving.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const actual = await vi.importActual('../../api.js');
  return { ...actual, cancelBooking: vi.fn() };
});

const driver = {
  id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg',
  vehicle: 'Honda Vario 150', plate: 'B 1234 ANT', rating: 4.9, etaMin: 1, distanceKm: 0.4,
};
const booking = { id: 'BKY1', pickup: { address: 'Jl. Merdeka 12' }, destination: { title: 'Kantor' } };

beforeEach(() => { papi.cancelBooking.mockResolvedValue({ id: 'BKY1', status: 'cancelled' }); });

describe('DriverArriving (3C-3C) — component', () => {
  it('renders live map, ETA, distance and arrival progress', () => {
    const { container } = render(<DriverArriving booking={booking} driver={driver} onPickupConfirmed={vi.fn()} />);
    expect(container.querySelector('.pasv-bmap__canvas')).toBeTruthy();
    expect(screen.getByText('Estimasi')).toBeInTheDocument();
    expect(screen.getByText(/km/)).toBeInTheDocument();
    // progressbar present
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows pickup reminder + confirm button once arrived, then navigates on confirm', async () => {
    vi.useFakeTimers();
    const onPickupConfirmed = vi.fn();
    render(<DriverArriving booking={booking} driver={driver} onPickupConfirmed={onPickupConfirmed} />);
    // arrival completes in ~12s (ARRIVE_SEC) — before mock PickupConfirmed (17s)
    await act(async () => { await vi.advanceTimersByTimeAsync(13000); });
    vi.useRealTimers();
    await waitFor(() => expect(screen.getByText(/Siap di titik jemput/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Konfirmasi Penjemputan'));
    await waitFor(() => expect(onPickupConfirmed).toHaveBeenCalled());
    expect(onPickupConfirmed.mock.calls[0][0].id).toBe('BKY1');
  });
});

describe('DriverArriving (3C-3C) — realtime navigation', () => {
  it('navigates on PickupConfirmed event', async () => {
    vi.useFakeTimers();
    const onPickupConfirmed = vi.fn();
    render(<DriverArriving booking={booking} driver={driver} onPickupConfirmed={onPickupConfirmed} />);
    // mock emits PickupConfirmed at 17s
    await act(async () => { await vi.advanceTimersByTimeAsync(17500); });
    vi.useRealTimers();
    await waitFor(() => expect(onPickupConfirmed).toHaveBeenCalled());
  });
});
