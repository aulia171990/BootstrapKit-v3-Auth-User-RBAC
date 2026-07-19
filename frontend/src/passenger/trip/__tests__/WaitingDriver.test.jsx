import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WaitingDriver from '../WaitingDriver.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const actual = await vi.importActual('../../api.js');
  return { ...actual, cancelBooking: vi.fn() };
});

const booking = {
  id: 'BKTEST1', status: 'waiting_driver',
  pickup: { address: 'Jl. Merdeka 12' },
  destination: { title: 'Kantor' },
};

beforeEach(() => {
  papi.cancelBooking.mockResolvedValue({ id: 'BKTEST1', status: 'cancelled' });
});

describe('WaitingDriver (3C-3A) — component', () => {
  it('shows searching state with booking id + ETA countdown', () => {
    render(<WaitingDriver booking={booking} onCancel={vi.fn()} onDriverAssigned={vi.fn()} />);
    expect(screen.getByText('Mencari Driver')).toBeInTheDocument();
    expect(screen.getByText(/BKTEST1/)).toBeInTheDocument();
    expect(screen.getByText(/Estimasi tunggu/)).toBeInTheDocument();
  });

  it('renders the map in waiting mode with pickup + destination', async () => {
    const { container } = render(<WaitingDriver booking={booking} onCancel={vi.fn()} onDriverAssigned={vi.fn()} />);
    // route loads async → ring appears once points exist
    await waitFor(() => expect(container.querySelector('.pasv-bmap__ring')).toBeTruthy());
    expect(screen.getByText('Jl. Merdeka 12')).toBeInTheDocument();
    expect(screen.getByText('Kantor')).toBeInTheDocument();
  });

  it('cancels booking and shows cancelled state', async () => {
    const onCancel = vi.fn();
    render(<WaitingDriver booking={booking} onCancel={onCancel} onDriverAssigned={vi.fn()} />);
    fireEvent.click(screen.getByText('Batalkan pesanan'));
    await waitFor(() => expect(screen.getAllByText('Pesanan dibatalkan').length).toBeGreaterThan(0));
    expect(papi.cancelBooking).toHaveBeenCalledWith('BKTEST1');
  });

  it('exposes an accessible progressbar', () => {
    render(<WaitingDriver booking={booking} onCancel={vi.fn()} onDriverAssigned={vi.fn()} />);
    const pb = screen.getByRole('progressbar');
    expect(pb).toHaveAttribute('aria-valuemax', '30');
  });
});

describe('WaitingDriver (3C-3A) — realtime navigation', () => {
  it('navigates to Driver Assigned on DriverAssigned event', async () => {
    vi.useFakeTimers();
    const onDriverAssigned = vi.fn();
    render(<WaitingDriver booking={booking} onCancel={vi.fn()} onDriverAssigned={onDriverAssigned} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(9500); });
    vi.useRealTimers();
    await waitFor(() => expect(onDriverAssigned).toHaveBeenCalled());
    const call = onDriverAssigned.mock.calls[0];
    expect(call[0].id).toBe('BKTEST1'); // booking
    expect(call[1].name).toBeTruthy(); // driver
  });
});
