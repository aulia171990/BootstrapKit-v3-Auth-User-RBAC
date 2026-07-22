import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PaymentMethods from '../PaymentMethods.jsx';
import * as papi from '../../api.js';

const noop = () => {};

describe('PaymentMethods (4D)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('lists methods grouped by kind with default indicator', async () => {
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([
      { id: 'pm1', kind: 'wallet', label: 'Dompet Ojol', detail: 'Saldo aktif', primary: true },
      { id: 'pm2', kind: 'card', label: 'Visa •••• 4921', detail: 'Budi A.', expires: '09/27' },
      { id: 'pm3', kind: 'cash', label: 'Tunai', detail: 'Bayar di akhir' },
    ]);
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    expect(await screen.findByText('Dompet Ojol')).toBeTruthy();
    expect(screen.getByText('Visa •••• 4921')).toBeTruthy();
    expect(screen.getByText('Utama')).toBeTruthy();
  });

  it('sets a method as default', async () => {
    const spy = vi.spyOn(papi, 'setDefaultPaymentMethod').mockResolvedValue({ id: 'pm2' });
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([
      { id: 'pm1', kind: 'wallet', label: 'Dompet Ojol', detail: 'Saldo', primary: true },
      { id: 'pm2', kind: 'card', label: 'Visa •••• 4921', detail: 'Budi A.', expires: '09/27' },
    ]);
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    const defaultBtn = await screen.findByLabelText('Jadikan utama Visa •••• 4921');
    fireEvent.click(defaultBtn);
    await waitFor(() => expect(spy).toHaveBeenCalledWith('pm2'));
  });

  it('adds a new card method', async () => {
    const spy = vi.spyOn(papi, 'addPaymentMethod').mockResolvedValue({ id: 'pm9', kind: 'card', label: 'Budi •••• 9999', detail: 'Budi' });
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([
      { id: 'pm1', kind: 'wallet', label: 'Dompet Ojol', detail: 'Saldo', primary: true },
    ]);
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByText('Tambah Metode'));
    fireEvent.change(screen.getByLabelText('Nama pada kartu'), { target: { value: 'Budi' } });
    fireEvent.change(screen.getByLabelText('Nomor kartu'), { target: { value: '4111111199999999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ kind: 'card', label: 'Budi •••• 9999' })));
  });

  it('removes a method after confirm', async () => {
    const spy = vi.spyOn(papi, 'removePaymentMethod').mockResolvedValue({ id: 'pm2' });
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([
      { id: 'pm1', kind: 'wallet', label: 'Dompet Ojol', detail: 'Saldo', primary: true },
      { id: 'pm2', kind: 'card', label: 'Visa •••• 4921', detail: 'Budi A.', expires: '09/27' },
    ]);
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByLabelText('Hapus Visa •••• 4921'));
    fireEvent.click(await screen.findByRole('button', { name: 'Hapus' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('pm2'));
  });

  it('shows empty state', async () => {
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    expect(await screen.findByText('Belum ada metode')).toBeTruthy();
  });

  it('shows error state and retry', async () => {
    vi.spyOn(papi, 'getPaymentMethods').mockRejectedValue(new Error('boom'));
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    expect(await screen.findByText('Gagal memuat metode')).toBeTruthy();
    fireEvent.click(screen.getByText('Coba lagi'));
  });

  it('shows offline banner', async () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    render(<PaymentMethods onBack={noop} onAdd={noop} onChanged={noop} />);
    expect(await screen.findByText(/Koneksi terputus/)).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });

  it('navigates back (onBack called)', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    render(<PaymentMethods onBack={onBack} onAdd={noop} onChanged={noop} />);
    fireEvent.click(await screen.findByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });
});
