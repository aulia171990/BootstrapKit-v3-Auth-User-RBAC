import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletHome from '../WalletHome.jsx';
import * as papi from '../../api.js';
import { theme } from '../../../design-system/index.js';

const noop = () => {};

describe('WalletHome (4G UX polish)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders with a dark-mode toggle and toggles theme', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, thisMonth: 0, tier: 'Silver' });
    const setSpy = vi.spyOn(theme, 'set').mockImplementation(() => {});
    vi.spyOn(theme, 'get').mockReturnValue('light');

    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} onSecurity={noop} onRefresh={noop} onRetry={noop} />);
    const toggle = await screen.findByRole('button', { name: 'Aktifkan mode gelap' });
    fireEvent.click(toggle);
    expect(setSpy).toHaveBeenCalledWith('dark');
  });

  it('exposes a Security quick action that navigates', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, thisMonth: 0, tier: 'Silver' });

    const onSecurity = vi.fn();
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} onSecurity={onSecurity} onRefresh={noop} onRetry={noop} />);
    const sec = await screen.findByRole('button', { name: 'Keamanan' });
    fireEvent.click(sec);
    expect(onSecurity).toHaveBeenCalled();
  });

  it('shows pull-to-refresh indicator region on the scroll container', async () => {
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR', pending: 0 });
    vi.spyOn(papi, 'getTransactions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPromotions').mockResolvedValue([]);
    vi.spyOn(papi, 'getPaymentMethods').mockResolvedValue([]);
    vi.spyOn(papi, 'getCashbackSummary').mockResolvedValue({ totalCashback: 0, thisMonth: 0, tier: 'Silver' });
    render(<WalletHome onTopUp={noop} onTransfer={noop} onPaymentMethods={noop} onHistory={noop} onPromo={noop} onSecurity={noop} onRefresh={noop} onRetry={noop} />);
    // The body is the scroll container with aria-busy; it should be present.
    await screen.findByText('Dompet');
    const main = document.querySelector('.pasv-wallet__body');
    expect(main).toBeTruthy();
    expect(main.getAttribute('aria-busy')).toBe('false');
  });
});
