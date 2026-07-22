import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopUp from '../TopUp.jsx';
import * as papi from '../../api.js';

const noop = () => {};

describe('TopUp (4C)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('selects preset amount and proceeds to channel', async () => {
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([
      { id: 'va_bca', label: 'BCA VA', kind: 'va', detail: 'BCA', icon: 'building' },
    ]);
    const onBack = vi.fn();
    render(<TopUp onBack={onBack} onDone={noop} onExportReceipt={noop} />);
    fireEvent.click(await screen.findByText('Rp 50.000'));
    fireEvent.click(screen.getByText('Lanjut'));
    expect(await screen.findByText('Pilih Metode')).toBeTruthy();
  });

  it('accepts custom amount', async () => {
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([{ id: 'qr', label: 'QRIS', kind: 'qr', detail: 'QR', icon: 'qr-code' }]);
    render(<TopUp onBack={noop} onDone={noop} onExportReceipt={noop} />);
    const input = await screen.findByLabelText('Nominal top up');
    fireEvent.change(input, { target: { value: '75000' } });
    fireEvent.click(screen.getByText('Lanjut'));
    expect(await screen.findByText('Pilih Metode')).toBeTruthy();
  });

  it('blocks amount below minimum', async () => {
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([]);
    render(<TopUp onBack={noop} onDone={noop} onExportReceipt={noop} />);
    const input = await screen.findByLabelText('Nominal top up');
    fireEvent.change(input, { target: { value: '5000' } });
    expect(screen.getByText(/Minimal top up/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeDisabled();
  });

  it('runs full flow: channel → confirm → status (VA) → receipt', async () => {
    const chan = { id: 'va_bca', label: 'BCA VA', kind: 'va', detail: 'BCA', icon: 'building' };
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([chan]);
    vi.spyOn(papi, 'createTopUp').mockResolvedValue({ id: 'TU1', status: 'pending', amount: 50000, currency: 'IDR', channel: 'va_bca', channelLabel: 'BCA VA', virtualAccount: '390112345678', expiresAt: new Date(Date.now() + 3600e3).toISOString(), createdAt: new Date().toISOString() });
    vi.spyOn(papi, 'confirmTopUp').mockResolvedValue({ id: 'TU1', status: 'completed', confirmedAt: new Date().toISOString() });
    render(<TopUp onBack={noop} onDone={noop} onExportReceipt={noop} />);
    fireEvent.click(await screen.findByText('Rp 50.000'));
    fireEvent.click(screen.getByText('Lanjut'));
    fireEvent.click(await screen.findByText('BCA VA'));
    fireEvent.click(screen.getByText('Lanjut'));
    // confirm screen
    fireEvent.click(await screen.findByText('Bayar Sekarang'));
    // status screen with VA
    expect(await screen.findByText('Menunggu Pembayaran')).toBeTruthy();
    expect(screen.getByText('390112345678')).toBeTruthy();
    fireEvent.click(screen.getByText('Saya Sudah Bayar'));
    // receipt
    expect(await screen.findByText('Top Up Berhasil')).toBeTruthy();
    expect(screen.getByText('Rp 50.000')).toBeTruthy();
  });

  it('shows QR placeholder for QR channel', async () => {
    const chan = { id: 'qr', label: 'QRIS', kind: 'qr', detail: 'QR', icon: 'qr-code' };
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([chan]);
    vi.spyOn(papi, 'createTopUp').mockResolvedValue({ id: 'TU2', status: 'pending', amount: 20000, currency: 'IDR', channel: 'qr', channelKind: 'qr', channelLabel: 'QRIS', virtualAccount: null, expiresAt: new Date().toISOString(), createdAt: new Date().toISOString() });
    render(<TopUp onBack={noop} onDone={noop} onExportReceipt={noop} />);
    fireEvent.click(await screen.findByText('Rp 20.000'));
    fireEvent.click(screen.getByText('Lanjut'));
    fireEvent.click(await screen.findByText('QRIS'));
    fireEvent.click(screen.getByText('Lanjut'));
    fireEvent.click(await screen.findByText('Bayar Sekarang'));
    expect(await screen.findByText('Menunggu Pembayaran')).toBeTruthy();
    expect(screen.getByTestId('qr-placeholder')).toBeTruthy();
  });

  it('navigates back on back button', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([]);
    render(<TopUp onBack={onBack} onDone={noop} onExportReceipt={noop} />);
    fireEvent.click(await screen.findByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });
});
