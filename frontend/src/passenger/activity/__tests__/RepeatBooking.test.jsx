import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RepeatBooking from '../RepeatBooking.jsx';
import * as papi from '../../api.js';

const trip = (o = {}) => ({
  id: 't1', pickup: 'Rumah', destination: 'Kantor', vehicle: 'Motor', vehicleKey: 'bike', fare: 18500, ...o,
});

beforeEach(() => { vi.restoreAllMocks(); });

describe('RepeatBooking — component', () => {
  it('prefills pickup & destination and shows recalculated fare', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 8.4, durationMin: 22, fare: 38500, currency: 'IDR', points: [[0, 0]] });
    render(<RepeatBooking trip={trip()} />);
    expect(await screen.findByText('Pesan Lagi')).toBeTruthy();
    expect(screen.getByText('Rumah')).toBeTruthy();
    expect(screen.getByText('Kantor')).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/8\.4 km/)).toBeTruthy());
  });

  it('edits pickup and recalculates the fare', async () => {
    const routeMock = vi.spyOn(papi, 'getRoute');
    routeMock.mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, currency: 'IDR', points: [] });
    render(<RepeatBooking trip={trip()} />);
    await screen.findByText('Rumah');
    // Open pickup edit.
    fireEvent.click(screen.getByRole('button', { name: 'Edit Jemput' }));
    const input = screen.getByLabelText('Edit Jemput');
    fireEvent.change(input, { target: { value: 'Kafe Senja' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeTruthy());
    // getRoute called again with new pickup.
    expect(routeMock).toHaveBeenCalledWith(expect.objectContaining({ address: 'Kafe Senja' }), expect.anything());
  });

  it('selects a vehicle', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, currency: 'IDR', points: [] });
    render(<RepeatBooking trip={trip()} />);
    const group = await screen.findByRole('radiogroup', { name: 'Kendaraan' });
    const motor = within(group).getByRole('radio', { name: /Motor/ });
    fireEvent.click(motor);
    expect(motor).toHaveAttribute('aria-checked', 'true');
  });
});

describe('RepeatBooking — flow', () => {
  it('proceeds to booking with the selection', async () => {
    const onProceed = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, currency: 'IDR', points: [] });
    render(<RepeatBooking trip={trip()} onProceed={onProceed} />);
    const btn = await screen.findByRole('button', { name: /Lanjutkan Pemesanan/ });
    fireEvent.click(btn);
    await waitFor(() => expect(onProceed).toHaveBeenCalled());
    const sel = onProceed.mock.calls[0][0];
    expect(sel.pickup.address).toBe('Rumah');
    expect(sel.destination.address).toBe('Kantor');
    expect(sel.vehicle).toBeTruthy();
    expect(sel.fare).toBeTruthy();
  });

  it('navigates back', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 5, durationMin: 12, fare: 20000, currency: 'IDR', points: [] });
    render(<RepeatBooking trip={trip()} onBack={onBack} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Kembali' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('accepts a prefill title "A → B"', async () => {
    vi.spyOn(papi, 'getRoute').mockResolvedValue({ distanceKm: 3, durationMin: 8, fare: 15000, currency: 'IDR', points: [] });
    render(<RepeatBooking prefill={{ title: 'Mall → Rumah' }} />);
    await waitFor(() => expect(screen.getByText('Mall')).toBeTruthy());
    expect(screen.getByText('Rumah')).toBeTruthy();
  });
});
