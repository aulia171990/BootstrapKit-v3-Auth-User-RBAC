import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Promo from '../Promo.jsx';
import * as papi from '../../api.js';

const noop = () => {};

describe('Promo & Voucher (4E)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  const baseMocks = () => {
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([
      { id: 'p1', code: 'HALO50', title: 'Diskon 50%', subtitle: 'Hari ini', kind: 'campaign', tone: 'primary', value: 50, valueType: 'percent', minSpend: 0, category: 'trip', status: 'active', eligible: true, eligibilityNote: 'Pengguna baru', description: 'd', terms: 't', expiry: new Date(Date.now() + 1e9).toISOString() },
      { id: 'p2', code: 'JALAN15', title: 'Voucher Rp15.000', subtitle: 'Min. 30rb', kind: 'voucher', tone: 'success', value: 15000, valueType: 'amount', minSpend: 30000, category: 'trip', status: 'active', eligible: false, eligibilityNote: 'Tidak berhak', description: 'd', terms: 't', expiry: new Date(Date.now() + 1e9).toISOString() },
    ]);
    vi.spyOn(papi, 'getPromoHistory').mockResolvedValue([
      { id: 'p4', code: 'MAKAN10', title: 'Food 10%', subtitle: 's', kind: 'campaign', tone: 'primary', value: 10, valueType: 'percent', minSpend: 50000, category: 'food', status: 'expired', eligible: false, eligibilityNote: 'Kadaluarsa', description: 'd', terms: 't', expiry: new Date(Date.now() - 1e9).toISOString() },
      { id: 'p5', code: 'POOL5', title: 'Voucher 5rb', subtitle: 's', kind: 'voucher', tone: 'success', value: 5000, valueType: 'amount', minSpend: 0, category: 'trip', status: 'used', eligible: false, eligibilityNote: 'Terpakai', description: 'd', terms: 't', usedAt: new Date(Date.now() - 1e9).toISOString(), expiry: new Date(Date.now() - 2e9).toISOString() },
    ]);
    vi.spyOn(papi, 'getAppliedPromo').mockResolvedValue(null);
    vi.spyOn(papi, 'getPromoDetail').mockImplementation(async (id) => {
      const pool = [
        { id: 'p1', code: 'HALO50', title: 'Diskon 50%', subtitle: 'Hari ini', kind: 'campaign', tone: 'primary', value: 50, valueType: 'percent', minSpend: 0, category: 'trip', status: 'active', eligible: true, eligibilityNote: 'Pengguna baru', description: 'd', terms: 't', expiry: new Date(Date.now() + 1e9).toISOString() },
        { id: 'p2', code: 'JALAN15', title: 'Voucher Rp15.000', subtitle: 'Min. 30rb', kind: 'voucher', tone: 'success', value: 15000, valueType: 'amount', minSpend: 30000, category: 'trip', status: 'active', eligible: false, eligibilityNote: 'Tidak berhak', description: 'd', terms: 't', expiry: new Date(Date.now() + 1e9).toISOString() },
      ];
      return pool.find((p) => p.id === id) || null;
    });
  };

  it('lists active vouchers with eligibility gating', async () => {
    baseMocks();
    render(<Promo onBack={noop} onChanged={noop} />);
    expect(await screen.findByText('Diskon 50%')).toBeTruthy();
    expect(screen.getByText('Voucher Rp15.000')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Gunakan Diskon 50%' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Gunakan Voucher Rp15.000' })).toBeDisabled();
  });

  it('opens promo detail with eligibility + terms', async () => {
    baseMocks();
    render(<Promo onBack={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByText('Diskon 50%'));
    expect(await screen.findByText('Syarat & Ketentuan:')).toBeTruthy();
    expect(screen.getByText('Anda berhak')).toBeTruthy();
    expect(screen.getByText('HALO50')).toBeTruthy();
  });

  it('applies an eligible promo', async () => {
    baseMocks();
    const spy = vi.spyOn(papi, 'applyPromo').mockResolvedValue({ id: 'p1' });
    render(<Promo onBack={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Gunakan Diskon 50%' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText(/diterapkan/)).toBeTruthy();
  });

  it('removes an applied promo', async () => {
    baseMocks();
    vi.spyOn(papi, 'applyPromo').mockResolvedValue({ id: 'p1' });
    const rmSpy = vi.spyOn(papi, 'removePromo').mockResolvedValue({ id: 'p1' });
    render(<Promo onBack={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Gunakan Diskon 50%' }));
    await screen.findByText(/diterapkan/);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus promo yang diterapkan' }));
    await waitFor(() => expect(rmSpy).toHaveBeenCalledWith('p1'));
  });

  it('shows expired and used history sections', async () => {
    baseMocks();
    render(<Promo onBack={noop} onChanged={noop} />);
    expect(await screen.findByRole('heading', { name: /Kadaluarsa/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Riwayat/ })).toBeTruthy();
    expect(screen.getByText('Food 10%')).toBeTruthy();
    expect(screen.getByText('Voucher 5rb')).toBeTruthy();
  });

  it('shows empty state when no active promos', async () => {
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromoHistory').mockResolvedValue([]);
    vi.spyOn(papi, 'getAppliedPromo').mockResolvedValue(null);
    render(<Promo onBack={noop} onChanged={noop} />);
    expect(await screen.findByText('Tidak ada promo aktif')).toBeTruthy();
  });

  it('shows offline banner', async () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    render(<Promo onBack={noop} onChanged={noop} />);
    expect(await screen.findByText(/Koneksi terputus/)).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });

  it('navigates back (onBack called)', async () => {
    const onBack = vi.fn();
    baseMocks();
    render(<Promo onBack={onBack} onChanged={noop} />);
    fireEvent.click(await screen.findByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });
});
