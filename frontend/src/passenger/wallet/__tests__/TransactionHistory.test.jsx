import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import TransactionHistory from '../TransactionHistory.jsx';
import * as papi from '../../api.js';

const noop = () => {};

describe('TransactionHistory (4B)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders paginated list grouped by date', async () => {
    const spy = vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({
      items: [
        { id: 'a', type: 'trip', title: 'Trip A', amount: -10000, currency: 'IDR', status: 'completed', at: new Date().toISOString() },
        { id: 'b', type: 'topup', title: 'Top Up B', amount: 50000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 86400e3).toISOString() },
      ],
      page: 1, pageSize: 8, total: 2, hasMore: false,
    });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    expect(await screen.findByText('Trip A')).toBeTruthy();
    expect(screen.getByText('Top Up B')).toBeTruthy();
    expect(screen.getByText((c) => c.includes('Akhir riwayat'))).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });

  it('shows load-more when hasMore, appends next page', async () => {
    vi.spyOn(papi, 'getTransactionHistory')
      .mockResolvedValueOnce({ items: [{ id: 'p1', type: 'trip', title: 'Page1', amount: -1, currency: 'IDR', status: 'completed', at: new Date().toISOString() }], page: 1, pageSize: 8, total: 9, hasMore: true })
      .mockResolvedValueOnce({ items: [{ id: 'p2', type: 'trip', title: 'Page2', amount: -1, currency: 'IDR', status: 'completed', at: new Date().toISOString() }], page: 2, pageSize: 8, total: 9, hasMore: false });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    expect(await screen.findByText('Page1')).toBeTruthy();
    fireEvent.click(screen.getByText('Muat lebih banyak'));
    expect(await screen.findByText('Page2')).toBeTruthy();
  });

  it('searches via query', async () => {
    const spy = vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    await screen.findByLabelText('Cari transaksi');
    fireEvent.change(screen.getByLabelText('Cari transaksi'), { target: { value: 'topup' } });
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ query: 'topup' })));
  });

  it('filters by status and type', async () => {
    const spy = vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    await screen.findByLabelText('Filter status');
    fireEvent.change(screen.getByLabelText('Filter status'), { target: { value: 'pending' } });
    fireEvent.change(screen.getByLabelText('Filter tipe'), { target: { value: 'transfer' } });
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', type: 'transfer' })));
  });

  it('opens detail dialog and exports receipt', async () => {
    const onExport = vi.fn();
    vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({
      items: [{ id: 'd1', type: 'trip', title: 'Detail Trip', amount: -15000, currency: 'IDR', status: 'completed', at: new Date().toISOString() }],
      page: 1, pageSize: 8, total: 1, hasMore: false,
    });
    render(<TransactionHistory onBack={noop} onExportReceipt={onExport} />);
    fireEvent.click(await screen.findByLabelText('Detail Detail Trip'));
    expect(await screen.findByText('Ekspor Struk')).toBeTruthy();
    fireEvent.click(screen.getByText('Ekspor Struk'));
    expect(onExport).toHaveBeenCalled();
  });

  it('shows empty state', async () => {
    vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    expect(await screen.findByText('Tidak ada transaksi')).toBeTruthy();
  });

  it('shows error state and retry', async () => {
    vi.spyOn(papi, 'getTransactionHistory').mockRejectedValue(new Error('boom'));
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    expect(await screen.findByText('Gagal memuat riwayat')).toBeTruthy();
    fireEvent.click(screen.getByText('Coba lagi'));
  });

  it('shows offline banner', async () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    render(<TransactionHistory onBack={noop} onExportReceipt={noop} />);
    expect(await screen.findByText(/Koneksi terputus/)).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });

  it('navigates back (onBack called)', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false });
    render(<TransactionHistory onBack={onBack} onExportReceipt={noop} />);
    fireEvent.click(await screen.findByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });
});
