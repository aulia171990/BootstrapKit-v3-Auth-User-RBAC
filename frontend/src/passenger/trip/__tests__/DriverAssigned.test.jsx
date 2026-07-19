import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DriverAssigned from '../DriverAssigned.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const actual = await vi.importActual('../../api.js');
  return { ...actual, cancelBooking: vi.fn() };
});

const driver = {
  id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg',
  vehicle: 'Honda Vario 150', plate: 'B 1234 ANT', rating: 4.9, etaMin: 3,
};
const booking = { id: 'BKX1', pickup: { address: 'Jl. Merdeka 12' }, destination: { title: 'Kantor' } };

beforeEach(() => { papi.cancelBooking.mockResolvedValue({ id: 'BKX1', status: 'cancelled' }); });

describe('DriverAssigned (3C-3B) — component', () => {
  it('renders the driver card with photo, rating, vehicle, plate, ETA', () => {
    render(<DriverAssigned booking={booking} driver={driver} onCancel={vi.fn()} onArriving={vi.fn()} />);
    expect(screen.getByText('Anto')).toBeInTheDocument();
    expect(screen.getByText('Honda Vario 150 · B 1234 ANT')).toBeInTheDocument();
    expect(screen.getByText(/4\.9/)).toBeInTheDocument();
    expect(screen.getByText(/3 mnt/)).toBeInTheDocument();
    // driver photo avatar used (aria-label)
    expect(screen.getByLabelText('Foto driver Anto')).toBeInTheDocument();
  });

  it('shows Call and Chat actions', () => {
    const onCall = vi.fn(); const onChat = vi.fn();
    render(<DriverAssigned booking={booking} driver={driver} onCall={onCall} onChat={onChat} onArriving={vi.fn()} />);
    fireEvent.click(screen.getByText('Telepon'));
    fireEvent.click(screen.getByText('Chat'));
    expect(onCall).toHaveBeenCalledWith(driver);
    expect(onChat).toHaveBeenCalledWith(driver);
  });

  it('Cancel is configurable and calls cancelBooking', async () => {
    const onCancel = vi.fn();
    const { rerender } = render(<DriverAssigned booking={booking} driver={driver} cancelEnabled onCancel={onCancel} onArriving={vi.fn()} />);
    fireEvent.click(screen.getByText('Batalkan pesanan'));
    await waitFor(() => expect(papi.cancelBooking).toHaveBeenCalledWith('BKX1', 'passenger'));
    // disabled mode: no cancel button
    rerender(<DriverAssigned booking={booking} driver={driver} cancelEnabled={false} onCancel={onCancel} onArriving={vi.fn()} />);
    expect(screen.queryByText('Batalkan pesanan')).not.toBeInTheDocument();
  });

  it('renders live driver location map (mode assigned)', () => {
    const { container } = render(<DriverAssigned booking={booking} driver={driver} onArriving={vi.fn()} />);
    expect(container.querySelector('.pasv-bmap__canvas')).toBeTruthy();
  });
});

describe('DriverAssigned (3C-3B) — realtime navigation', () => {
  it('navigates to Driver Arriving on DriverArriving event', async () => {
    vi.useFakeTimers();
    const onArriving = vi.fn();
    render(<DriverAssigned booking={booking} driver={driver} onArriving={onArriving} onCancel={vi.fn()} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(15500); });
    vi.useRealTimers();
    await waitFor(() => expect(onArriving).toHaveBeenCalled());
    const call = onArriving.mock.calls[0];
    expect(call[0].id).toBe('BKX1');
    expect(call[1].name).toBe('Anto');
  });
});
