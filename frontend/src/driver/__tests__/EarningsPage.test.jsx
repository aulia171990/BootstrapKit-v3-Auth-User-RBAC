import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EarningsPage from '../pages/EarningsPage.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    todayEarnings: vi.fn(),
    weeklyEarnings: vi.fn(),
    monthlyEarnings: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  driverAPI.todayEarnings.mockResolvedValue({ total: 185000, trips: 8, bonus: 15000, cash: 45000 });
  driverAPI.weeklyEarnings.mockResolvedValue({ total: 1250000, trips: 42, bonus: 120000 });
  driverAPI.monthlyEarnings.mockResolvedValue({ total: 4850000, trips: 168, bonus: 450000 });
});

describe('EarningsPage', () => {
  it('renders page title', async () => {
    render(<EarningsPage onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Pendapatan')).toBeInTheDocument());
  });

  it('shows period buttons', async () => {
    render(<EarningsPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Hari Ini')).toBeInTheDocument();
      expect(screen.getByText('Minggu Ini')).toBeInTheDocument();
      expect(screen.getByText('Bulan Ini')).toBeInTheDocument();
    });
  });

  it('renders today earnings by default', async () => {
    render(<EarningsPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getAllByText(/185.000/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
