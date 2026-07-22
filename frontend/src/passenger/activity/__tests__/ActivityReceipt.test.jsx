import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityReceipt from '../ActivityReceipt.jsx';
import * as papi from '../../api.js';

const receipt = (o = {}) => ({
  trip: {
    id: 't1', code: 'TRP-1', date: new Date().toISOString(),
    pickup: 'Rumah', destination: 'Kantor', fare: 18500, currency: 'IDR',
    status: 'completed', statusLabel: 'Selesai', statusTone: 'success',
    vehicle: 'Motor', driverName: 'Anto', paymentMethod: 'Wallet', raw: { promo_code: 'HALO50', promo_discount: 2000 },
  },
  transactionId: 'TX-t1-abc',
  issuedAt: new Date().toISOString(),
  paidVia: 'Wallet',
  walletUsage: 18500,
  tax: 1850,
  promoCode: 'HALO50',
  promoAmount: 2000,
  source: 'demo',
  ...o,
});

beforeEach(() => { vi.restoreAllMocks(); });

describe('ActivityReceipt — component', () => {
  it('renders receipt with transaction id, fare, promo, tax', async () => {
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    render(<ActivityReceipt tripId="t1" />);
    expect(await screen.findByText(/RCPT-t1/)).toBeTruthy();
    expect(screen.getByText('TX: TX-t1-abc')).toBeTruthy();
    expect(screen.getAllByText('Rp 18.500', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText('Promo HALO50')).toBeTruthy();
    expect(screen.getAllByText('Pajak').length).toBeGreaterThan(0);
    expect(screen.getByText('Penggunaan Dompet')).toBeTruthy();
  });

  it('switches to Invoice tab and shows invoice number', async () => {
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    render(<ActivityReceipt tripId="t1" />);
    await screen.findByText(/RCPT-t1/);
    fireEvent.click(screen.getByRole('tab', { name: 'Invoice' }));
    expect(screen.getByText(/^INV-/)).toBeTruthy();
  });

  it('shows loading then content', async () => {
    vi.spyOn(papi, 'getReceipt').mockImplementation(() => new Promise(() => {}));
    render(<ActivityReceipt tripId="t1" />);
    expect(screen.getByText('Receipt & Invoice')).toBeTruthy();
    expect(screen.queryByText(/RCPT-t1/)).toBeNull();
  });

  it('shows error state', async () => {
    vi.spyOn(papi, 'getReceipt').mockRejectedValue(new Error('boom'));
    render(<ActivityReceipt tripId="t1" />);
    expect(await screen.findByText('Gagal memuat receipt')).toBeTruthy();
  });

  it('shows not-found when null', async () => {
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(null);
    render(<ActivityReceipt tripId="missing" />);
    expect(await screen.findByText('Receipt tidak ditemukan')).toBeTruthy();
  });
});

describe('ActivityReceipt — actions', () => {
  it('calls onDownload on Download PDF', async () => {
    const onDownload = vi.fn();
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    // jsdom lacks URL.createObjectURL
    global.URL.createObjectURL = global.URL.createObjectURL || (() => 'blob:x');
    global.URL.revokeObjectURL = global.URL.revokeObjectURL || (() => {});
    render(<ActivityReceipt tripId="t1" onDownload={onDownload} />);
    fireEvent.click(await screen.findByRole('button', { name: /Download PDF/ }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('calls onShare on Share', async () => {
    const onShare = vi.fn();
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    render(<ActivityReceipt tripId="t1" onShare={onShare} />);
    fireEvent.click(await screen.findByRole('button', { name: /Share/ }));
    await waitFor(() => expect(onShare).toHaveBeenCalled());
  });

  it('opens email dialog and sends', async () => {
    const onEmail = vi.fn();
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    vi.spyOn(papi, 'emailReceipt').mockResolvedValue({ id: 't1', email: 'a@b.com', status: 'sent' });
    render(<ActivityReceipt tripId="t1" onEmail={onEmail} />);
    fireEvent.click(await screen.findByRole('button', { name: /Email/ }));
    const input = await screen.findByLabelText('Alamat email');
    fireEvent.change(input, { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    await waitFor(() => expect(onEmail).toHaveBeenCalledWith('a@b.com'));
  });

  it('navigates back', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getReceipt').mockResolvedValue(receipt());
    render(<ActivityReceipt tripId="t1" onBack={onBack} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Kembali' }));
    expect(onBack).toHaveBeenCalled();
  });
});
