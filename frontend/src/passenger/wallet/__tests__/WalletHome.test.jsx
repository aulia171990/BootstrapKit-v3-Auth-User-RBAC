import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WalletHome from '../WalletHome.jsx';
import * as papi from '../../api.js';

const noop = () => {};

afterEach(() => { vi.restoreAllMocks(); });

describe('WalletHome (4A)', () => {
  it('renders balance, quick actions, transactions, promos, methods, cashback', async () => {
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();
    // balance formatted with IDR
    expect(screen.getByText('Rp 125.000')).toBeTruthy();
    // quick actions
    expect(screen.getByText('Top Up')).toBeTruthy();
    expect(screen.getByText('Transfer')).toBeTruthy();
    expect(screen.getByText('Metode')).toBeTruthy();
    // recent transactions preview (5)
    expect(screen.getByText('Trip · Rumah → Kantor')).toBeTruthy();
    // promotions
    expect(screen.getByText('Diskon 50% perjalanan pertama')).toBeTruthy();
    // payment methods
    expect(screen.getByText('Dompet Ojol')).toBeTruthy();
    // cashback
    expect(screen.getByText('Total Cashback')).toBeTruthy();
    expect(screen.getByText('Rp 7.000')).toBeTruthy();
  });

  it('shows held balance when present', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 100000, currency: 'IDR', held: 5000, source: 'demo' });
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    expect(await screen.findByText(/Saldo tertahan/)).toBeTruthy();
    expect(screen.getByText((c) => c.includes('Rp 5.000'))).toBeTruthy();
  });

  it('navigates via quick actions', async () => {
    const onTopUp = vi.fn(); const onHistory = vi.fn(); const onPaymentMethods = vi.fn(); const onPromo = vi.fn();
    render(<WalletHome onTopUp={onTopUp} onTransfer={noop} onPaymentMethods={onPaymentMethods} onHistory={onHistory} onPromo={onPromo} />);
    await screen.findByText('Saldo Tersedia');
    fireEvent.click(screen.getByText('Top Up'));
    fireEvent.click(screen.getByText('Riwayat'));
    fireEvent.click(screen.getByText('Metode'));
    fireEvent.click(screen.getByText('Promo'));
    expect(onTopUp).toHaveBeenCalled();
    expect(onHistory).toHaveBeenCalled();
    expect(onPaymentMethods).toHaveBeenCalled();
    expect(onPromo).toHaveBeenCalled();
  });

  it('hides and shows balance on eye toggle', async () => {
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    await screen.findByText('Saldo Tersedia');
    const eye = screen.getByLabelText('Sembunyikan saldo');
    fireEvent.click(eye);
    expect(screen.getByText('Rp ••••••')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Tampilkan saldo'));
    expect(screen.getByText('Rp 125.000')).toBeTruthy();
  });

  it('shows empty state when no transactions', async () => {
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    expect(await screen.findByText('Belum ada transaksi')).toBeTruthy();
  });

  it('shows loading skeletons then content', async () => {
    let resolveWallet;
    vi.spyOn(papi, 'getWallet').mockImplementation(() => new Promise((r) => { resolveWallet = r; }));
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, currency: 'IDR', thisMonth: 0, pending: 0, tier: 'Silver' });
    const { container } = render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    // aria-busy during load
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    act(() => { resolveWallet({ balance: 125000, currency: 'IDR', pending: 0 }); });
    expect(await screen.findByText('Rp 125.000')).toBeTruthy();
  });

  it('shows error state and retry', async () => {
    vi.spyOn(papi, 'getWallet').mockRejectedValue(new Error('boom'));
    const onRetry = vi.fn();
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} onRetry={onRetry} />);
    expect(await screen.findByText('Gagal memuat dompet')).toBeTruthy();
    // click Coba lagi resets error
    fireEvent.click(screen.getByText('Coba lagi'));
    expect(onRetry).not.toHaveBeenCalled(); // onRetry only used in offline path
    expect(screen.queryByText('Gagal memuat dompet')).toBeFalsy();
  });

  it('shows offline banner when navigator is offline', async () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} onRetry={noop} />);
    expect(await screen.findByText(/Koneksi terputus/)).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });
});

describe('WalletHome — premium layout (syarat tampilan)', () => {
  it('renders Top Up as primary CTA and shows the pick-method button', async () => {
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();
    const cta = screen.getByRole('button', { name: /Top Up/i });
    expect(cta).toBeTruthy();
    expect(screen.getByText(/Pilih metode & voucher/i)).toBeTruthy();
  });

  it('opens the payment & voucher bottom sheet', async () => {
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} />);
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();
    fireEvent.click(screen.getByText(/Pilih metode & voucher/i));
    expect(await screen.findByText('Pilih Metode Pembayaran')).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Metode/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Voucher/i })).toBeTruthy();
  });

  it('shows "View All" linking to history', async () => {
    const onHistory = vi.fn();
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={onHistory} onPromo={noop} />);
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();
    fireEvent.click(screen.getByText('View All'));
    expect(onHistory).toHaveBeenCalled();
  });
});

describe('Wallet navigation (through PassengerApp)', () => {
  it('wallet tab → Top Up navigates to sub-screen', async () => {
    const { default: PassengerApp } = await import('../../PassengerApp.jsx');
    render(<PassengerApp user={{ name: 'Budi', email: 'budi@ojol.test' }} />);
    // switch to wallet tab
    fireEvent.click(await screen.findByRole('button', { name: 'Wallet' }));
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();
    fireEvent.click(screen.getByText('Top Up'));
    expect(await screen.findByText('Nominal Top Up')).toBeTruthy();
  });
});
