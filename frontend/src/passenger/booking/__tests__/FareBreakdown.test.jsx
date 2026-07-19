import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FareBreakdown from '../FareBreakdown.jsx';
import { estimateFare, getVehicle } from '../pricingEngine.js';

const car = getVehicle('car');
const route = { distanceKm: 8.4, durationMin: 22 };
const fare = estimateFare(car, route, { surgeMultiplier: 1.8, promoDiscount: 2000 });

describe('FareBreakdown (3B-2E)', () => {
  it('renders canonical lines from a precomputed fare', () => {
    render(<FareBreakdown fare={fare} />);
    // 3B-2E required labels
    expect(screen.getByText('Tarif dasar')).toBeInTheDocument();
    expect(screen.getByText(/Jarak/)).toBeInTheDocument();
    expect(screen.getByText(/Waktu/)).toBeInTheDocument();
    expect(screen.getByText(/Surge/)).toBeInTheDocument();
    expect(screen.getByText('Diskon')).toBeInTheDocument();
    expect(screen.getByText(/Pajak/)).toBeInTheDocument();
    expect(screen.getByText('Total harga')).toBeInTheDocument();
  });

  it('computes the fare itself when given raw vehicle/route/surge/discount', () => {
    render(
      <FareBreakdown
        vehicle={car}
        route={route}
        surge={{ multiplier: 1.8, level: 'Tinggi' }}
        discount={2000}
      />,
    );
    expect(screen.getByText('Tarif dasar')).toBeInTheDocument();
    // Final price matches the shared engine output.
    expect(screen.getByText(`Rp ${Number(fare.finalFare).toLocaleString('id-ID')}`)).toBeInTheDocument();
  });

  it('shows discount as a deduction (negative)', () => {
    render(<FareBreakdown fare={fare} />);
    // promo_discount is stored negative → rendered in success tone (neg class)
    const discount = screen.getByText('Diskon').closest('.pasv-fare2__line').querySelector('.pasv-fare2__amount');
    expect(discount.className).toContain('pasv-fare2__amount--neg');
  });

  it('is display-only: no confirm/booking action', () => {
    const { container } = render(<FareBreakdown fare={fare} />);
    expect(container.querySelector('.pasv-book__confirm-btn')).toBeNull();
  });
});
