import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FareReview from '../FareReview.jsx';
import * as papi from '../../api.js';
import { estimateFare, getVehicle } from '../pricingEngine.js';

vi.mock('../../api.js', () => ({ getRoute: vi.fn() }));

const pickup = { address: 'Jl. Merdeka 12', coord: { lat: -6.2, lng: 106.8 } };
const dest = { address: 'Kantor Menara BCA', title: 'Kantor' };
const route = { distanceKm: 8.4, durationMin: 22, points: [[18, 78], [78, 26]] };

beforeEach(() => {
  papi.getRoute.mockResolvedValue({ from: 'A', to: 'B', distanceKm: 8.4, durationMin: 22, fare: 38500, currency: 'IDR', points: [[18, 78], [78, 26]] });
});

function setup(opts = {}) {
  const vehicle = getVehicle('car');
  const fare = estimateFare(vehicle, { distanceKm: route.distanceKm, durationMin: route.durationMin }, { surgeMultiplier: opts.surge || 1 });
  return render(
    <FareReview
      pickup={pickup}
      destination={dest}
      vehicle={vehicle}
      fare={fare}
      route={route}
      surge={{ multiplier: opts.surge || 1, level: opts.surge ? 'Tinggi' : 'Normal' }}
      user={null}
      onBack={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );
}

describe('FareReview (3B-2D)', () => {
  it('shows vehicle summary, full fare breakdown, and total', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Tinjau Tarif')).toBeInTheDocument());
    expect(screen.getByText('Mobil')).toBeInTheDocument();
    expect(screen.getByText('Rincian tarif')).toBeInTheDocument();
    expect(screen.getByText('Total dibayar')).toBeInTheDocument();
    // Total amount rendered
    expect(screen.getAllByText(/^Rp /).length).toBeGreaterThan(0);
  });

  it('shows dynamic pricing when surge is present', async () => {
    setup({ surge: 1.8 });
    await waitFor(() => expect(screen.getByText(/Harga dinamis/)).toBeInTheDocument());
  });

  it('confirms and navigates onward', async () => {
    const onConfirm = vi.fn();
    const vehicle = getVehicle('car');
    const fare = estimateFare(vehicle, { distanceKm: route.distanceKm, durationMin: route.durationMin });
    render(<FareReview pickup={pickup} destination={dest} vehicle={vehicle} fare={fare} route={route} surge={{ multiplier: 1, level: 'Normal' }} user={null} onBack={vi.fn()} onConfirm={onConfirm} />);
    await waitFor(() => expect(screen.getByText(/Pesan/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Pesan/));
    expect(onConfirm).toHaveBeenCalled();
  });
});
