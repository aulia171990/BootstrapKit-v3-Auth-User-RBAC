import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentSelection from '../PaymentSelection.jsx';
import * as papi from '../../api.js';
import { estimateFare, getVehicle } from '../pricingEngine.js';

vi.mock('../../api.js', () => ({
  getPromotions: vi.fn(),
  getWallet: vi.fn(),
}));

const car = getVehicle('car');
const route = { distanceKm: 8.4, durationMin: 22 };
const fare = estimateFare(car, route, { surgeMultiplier: 1 });

beforeEach(() => {
  papi.getPromotions.mockResolvedValue([
    { id: 'p1', title: 'Diskon 50%', subtitle: 'Hari ini', code: 'HALO50', tone: 'primary', kind: 'campaign' },
    { id: 'p2', title: 'Voucher Rp15.000', subtitle: 'Min 30rb', code: 'JALAN15', tone: 'success', kind: 'voucher' },
  ]);
  papi.getWallet.mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
});

describe('PaymentSelection (3B-2F)', () => {
  it('loads promos + wallet and renders payment methods', async () => {
    render(<PaymentSelection vehicle={car} route={route} surge={{ multiplier: 1 }} fare={fare} onBack={vi.fn()} onConfirm={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('HALO50')).toBeInTheDocument());
    expect(screen.getByText('Dompet Ojol')).toBeInTheDocument();
    expect(screen.getByText('Tunai')).toBeInTheDocument();
    expect(screen.getByText('Kartu Kredit')).toBeInTheDocument();
    expect(screen.getByText('Kartu Tersimpan')).toBeInTheDocument();
  });

  it('applies a promo discount to the fare summary', async () => {
    render(<PaymentSelection vehicle={car} route={route} surge={{ multiplier: 1 }} fare={fare} onBack={vi.fn()} onConfirm={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('HALO50')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Diskon 50%'));
    await waitFor(() => {
      // Select promo => final fare drops by promo value (5000) via shared engine.
      const expected = estimateFare(car, route, { surgeMultiplier: 1, promoDiscount: 5000 }).finalFare;
      expect(screen.getByText(`Rp ${expected.toLocaleString('id-ID')}`)).toBeInTheDocument();
    });
  });

  it('applies a voucher code', async () => {
    render(<PaymentSelection vehicle={car} route={route} surge={{ multiplier: 1 }} fare={fare} onBack={vi.fn()} onConfirm={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('HALO50')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Kode voucher'), { target: { value: 'JALAN15' } });
    fireEvent.click(screen.getByText('Pakai'));
    await waitFor(() => expect(screen.getByText('Voucher JALAN15 aktif · Rp 15.000')).toBeInTheDocument());
  });

  it('disables wallet method when balance is insufficient', async () => {
    papi.getWallet.mockResolvedValue({ balance: 1000, currency: 'IDR', pending: 0 });
    render(<PaymentSelection vehicle={car} route={route} surge={{ multiplier: 1 }} fare={fare} onBack={vi.fn()} onConfirm={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Dompet Ojol')).toBeInTheDocument());
    expect(screen.getByText(/Saldo dompet tidak cukup/)).toBeInTheDocument();
  });

  it('is display/selection only — confirm passes selection payload', async () => {
    const onConfirm = vi.fn();
    render(<PaymentSelection vehicle={car} route={route} surge={{ multiplier: 1 }} fare={fare} onBack={vi.fn()} onConfirm={onConfirm} />);
    await waitFor(() => expect(screen.getByText('Dompet Ojol')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Lanjutkan Pembayaran'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls[0][0].method).toBe('wallet');
  });
});
