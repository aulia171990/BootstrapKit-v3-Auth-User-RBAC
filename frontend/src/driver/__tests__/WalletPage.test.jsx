import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WalletPage from '../pages/WalletPage.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    walletBalance: vi.fn(),
    walletTransactions: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WalletPage', () => {
  it('keeps page visible if transactions fail', async () => {
    driverAPI.walletBalance.mockResolvedValue({ balance: 120000 });
    driverAPI.walletTransactions.mockRejectedValue(new Error('boom'));

    render(<WalletPage onBack={vi.fn()} onHistory={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Dompet')).toBeTruthy());
    expect(screen.getByText('Saldo Tersedia')).toBeTruthy();
    expect(screen.getByText('Rp 120.000')).toBeTruthy();
    expect(screen.getByText('Belum ada transaksi')).toBeTruthy();
  });
});
