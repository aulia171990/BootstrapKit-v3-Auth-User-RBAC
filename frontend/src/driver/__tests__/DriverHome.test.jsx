import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DriverHome from '../DriverHome.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    profile: vi.fn(),
    walletBalance: vi.fn(),
    driverStatus: vi.fn(),
    todayEarnings: vi.fn(),
    notificationUnread: vi.fn(),
    updateOnlineStatus: vi.fn(),
  },
}));

const mockProfile = {
  name: 'Rizky Driver',
  email: 'rizky@ojol.id',
};

const mockStats = {
  isOnline: true,
  zone: 'Jakarta Pusat',
  todayTrips: 8,
  acceptanceRate: 97.5,
  rating: 4.9,
  vehicle: { plate: 'B 1234 ABC', type: 'motor', model: 'Honda Vario' },
  driverCode: 'DRV-001',
};

const mockToday = { total: 185000, trips: 8, cash: 45000, bonus: 15000 };

beforeEach(() => {
  vi.clearAllMocks();
  driverAPI.profile.mockResolvedValue(mockProfile);
  driverAPI.walletBalance.mockResolvedValue(120000);
  driverAPI.driverStatus.mockResolvedValue(mockStats);
  driverAPI.todayEarnings.mockResolvedValue(mockToday);
  driverAPI.notificationUnread.mockResolvedValue({ count: 2 });
});

describe('DriverHome — rendering', () => {
  it('renders greeting with user name', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
  });

  it('shows email from profile', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('rizky@ojol.id')).toBeInTheDocument());
  });

  it('displays online status badge', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());
  });

  it('renders earnings with formatted amount', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getAllByText('Pendapatan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Rp 185.000/)).toBeInTheDocument();
    });
  });

  it('renders wallet balance', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Saldo Dompet')).toBeInTheDocument();
      expect(screen.getByText('Rp 120.000')).toBeInTheDocument();
    });
  });

  it('renders menu cepat section', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Menu Cepat')).toBeInTheDocument());
  });

  it('shows unread notification count', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });
});

describe('DriverHome — navigation', () => {
  it('trip card navigates to trips tab', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('8')));
  });

  it('safety button navigates to safety page', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Darurat')));
    expect(onNavigate).toHaveBeenCalledWith('safety');
  });

  it('notifications button navigates to notifications', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Notifikasi')));
    expect(onNavigate).toHaveBeenCalledWith('notifications');
  });
});

describe('DriverHome — API error', () => {
  it('shows error on API failure when no cached profile', async () => {
    driverAPI.profile.mockRejectedValue(new Error('Network Error'));
    driverAPI.driverStatus.mockRejectedValue(new Error('Network Error'));
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat/)).toBeInTheDocument());
  });
});
