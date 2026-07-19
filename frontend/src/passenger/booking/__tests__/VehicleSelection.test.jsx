import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import VehicleSelection from '../VehicleSelection.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', () => ({
  getRoute: vi.fn(),
}));

const pickup = { address: 'Jl. Merdeka 12', coord: { lat: -6.2, lng: 106.8 } };
const dest = { address: 'Kantor Menara BCA', title: 'Kantor' };

beforeEach(() => {
  papi.getRoute.mockResolvedValue({
    from: 'Jl. Merdeka 12', to: 'Kantor Menara BCA',
    distanceKm: 8.4, durationMin: 22, fare: 38500, currency: 'IDR',
    points: [[18, 78], [78, 26]],
  });
});

describe('VehicleSelection (3B-2C)', () => {
  it('shows available vehicles with ETA, capacity, and estimated fare', async () => {
    render(<VehicleSelection pickup={pickup} destination={dest} onBack={vi.fn()} onConfirmVehicle={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Pilih Kendaraan')).toBeInTheDocument());
    expect(screen.getByText('Motor')).toBeInTheDocument();
    expect(screen.getByText('Mobil')).toBeInTheDocument();
    expect(screen.getByText('Mobil XL')).toBeInTheDocument();
    // capacity labels + fares present
    expect(screen.getAllByText('4 orang').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Rp /).length).toBeGreaterThan(0);
  });

  it('shows a dynamic-pricing (surge) state, normal or active', async () => {
    render(<VehicleSelection pickup={pickup} destination={dest} onBack={vi.fn()} onConfirmVehicle={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Pilih Kendaraan')).toBeInTheDocument());
    const hasNormal = screen.queryByText(/Harga normal/);
    const hasActive = screen.queryByText(/Harga dinamis/);
    expect(hasNormal || hasActive).toBeTruthy();
  });

  it('expands vehicle details on select', async () => {
    render(<VehicleSelection pickup={pickup} destination={dest} onBack={vi.fn()} onConfirmVehicle={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Motor')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Motor'));
    await waitFor(() => expect(screen.getByText('Tarif dasar')).toBeInTheDocument());
  });

  it('confirms selected vehicle and routes to fare review', async () => {
    const onConfirm = vi.fn();
    render(<VehicleSelection pickup={pickup} destination={dest} onBack={vi.fn()} onConfirmVehicle={onConfirm} />);
    await waitFor(() => expect(screen.getByText('Motor')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Pilih Mobil/ }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    const payload = onConfirm.mock.calls[0][0];
    expect(payload.vehicle.id).toBeTruthy();
    expect(payload.fare.components.length).toBeGreaterThan(0);
    expect(payload.route.distanceKm).toBe(8.4);
  });

  it('renders error state when route fails', async () => {
    papi.getRoute.mockRejectedValueOnce(new Error('fail'));
    render(<VehicleSelection pickup={pickup} destination={dest} onBack={vi.fn()} onConfirmVehicle={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat/)).toBeInTheDocument());
  });
});
