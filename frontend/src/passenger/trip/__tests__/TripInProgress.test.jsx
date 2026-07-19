import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TripInProgress from '../TripInProgress.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const actual = await vi.importActual('../../api.js');
  return { ...actual, shareTrip: vi.fn(), stopTrip: vi.fn(), cancelBooking: vi.fn() };
});

const driver = {
  id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg',
  vehicle: 'Honda Vario 150', plate: 'B 1234 ANT', rating: 4.9, etaMin: 22, distanceKm: 8.4,
};
const booking = { id: 'BKZ1', distanceKm: 8.4, pickup: { address: 'Jl. Merdeka 12' }, destination: { title: 'Kantor' } };

beforeEach(() => {
  papi.shareTrip.mockResolvedValue({ id: 'BKZ1', url: 'https://ojol.test/t/abc' });
  papi.stopTrip.mockResolvedValue({ id: 'BKZ1', status: 'stopped_by_operator' });
});

describe('TripInProgress (3C-3D) — component', () => {
  it('renders route, ETA, distance, driver card, trip progress', () => {
    const { container } = render(<TripInProgress booking={booking} driver={driver} onCancel={vi.fn()} />);
    expect(container.querySelector('.pasv-bmap__canvas')).toBeTruthy();
    expect(screen.getByText('Estimasi tiba')).toBeInTheDocument();
    expect(screen.getByText(/km/)).toBeInTheDocument();
    expect(screen.getByText('Anto')).toBeInTheDocument();
    expect(screen.getByText('Honda Vario 150 · B 1234 ANT')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows Share Trip button and copies the link', async () => {
    render(<TripInProgress booking={booking} driver={driver} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Bagikan Perjalanan'));
    await waitFor(() => expect(papi.shareTrip).toHaveBeenCalledWith('BKZ1'));
    await waitFor(() => expect(screen.getByText(/ojol\.test\/t\//)).toBeInTheDocument());
  });

  it('hides Stop Trip for passengers, shows it for operators', () => {
    const { rerender } = render(<TripInProgress booking={booking} driver={driver} onCancel={vi.fn()} />);
    expect(screen.queryByText('Stop Trip')).not.toBeInTheDocument();
    rerender(<TripInProgress booking={booking} driver={driver} operator onStopTrip={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Stop Trip')).toBeInTheDocument();
  });
});

describe('TripInProgress (3C-3D) — realtime', () => {
  it('updates on TripProgress and completes on TripCompleted', async () => {
    vi.useFakeTimers();
    const onCompleted = vi.fn();
    render(<TripInProgress booking={booking} driver={driver} onCompleted={onCompleted} onCancel={vi.fn()} />);
    // mock emits TripProgress at 19/21/23s and TripCompleted at 25s
    await act(async () => { await vi.advanceTimersByTimeAsync(25500); });
    vi.useRealTimers();
    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
  });
});
