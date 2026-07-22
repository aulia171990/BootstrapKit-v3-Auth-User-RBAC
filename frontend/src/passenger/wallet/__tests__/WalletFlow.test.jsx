import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PassengerApp from '../../PassengerApp.jsx';
import * as papi from '../../api.js';

const user = { name: 'Budi', email: 'budi@ojol.test' };

describe('Wallet forward navigation flow', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('chains History → Payment Methods → Promo → Security', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, thisMonth: 0, tier: 'Silver' });
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockResolvedValue({ ok: true });
    vi.spyOn(papi, 'getTransactionHistory').mockResolvedValue({ items: [], hasMore: false, total: 0 });

    render(<PassengerApp user={user} onLogout={() => {}} />);

    // Go to Wallet tab
    fireEvent.click(await screen.findByRole('button', { name: 'Wallet' }));
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();

    // History → Payment Methods
    fireEvent.click(screen.getByText('Riwayat'));
    expect(await screen.findByText('Riwayat Transaksi')).toBeTruthy();
    fireEvent.click(await screen.findByRole('button', { name: 'Lanjut' }));
    expect(await screen.findByText('Metode Pembayaran')).toBeTruthy();

    // Payment Methods → Promo
    fireEvent.click(await screen.findByRole('button', { name: 'Lanjut' }));
    expect(await screen.findByText('Promo & Voucher')).toBeTruthy();

    // Promo → Security
    fireEvent.click(await screen.findByRole('button', { name: 'Lanjut' }));
    // Security is gated by PIN; unlock to reveal the dashboard title
    const pin = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(pin, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    expect(await screen.findByText('Keamanan Dompet')).toBeTruthy();
  });

  it('chains Top Up → Payment Methods', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, thisMonth: 0, tier: 'Silver' });
    vi.spyOn(papi, 'getTopUpChannels').mockResolvedValue([{ id: 'wallet', label: 'Dompet Ojol', kind: 'wallet', detail: 'Potong dari saldo', icon: 'wallet' }]);
    vi.spyOn(papi, 'createTopUp').mockResolvedValue({ id: 'TU1', status: 'completed', amount: 50000, currency: 'IDR', channel: 'wallet', channelLabel: 'Dompet Ojol', channelKind: 'wallet', virtualAccount: null, expiresAt: new Date().toISOString(), createdAt: new Date().toISOString() });
    vi.spyOn(papi, 'confirmTopUp').mockResolvedValue({ id: 'TU1', status: 'completed', confirmedAt: new Date().toISOString() });

    render(<PassengerApp user={user} onLogout={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Wallet' }));
    expect(await screen.findByText('Saldo Tersedia')).toBeTruthy();

    fireEvent.click(screen.getByText('Top Up'));
    fireEvent.click(await screen.findByText('Rp 50.000'));
    fireEvent.click(screen.getByText('Lanjut'));
    // select channel
    fireEvent.click(await screen.findByText('Dompet Ojol'));
    fireEvent.click(screen.getByText('Lanjut'));
    // confirm + status (wallet channel → completed directly)
    fireEvent.click(await screen.findByText('Bayar Sekarang'));
    // wallet channel → completed directly → result state
    expect(await screen.findByText('Pembayaran Berhasil')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Lihat Struk' }));
    expect(await screen.findByText('Top Up Berhasil')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));
    expect(await screen.findByText('Metode Pembayaran')).toBeTruthy();
  });
});
