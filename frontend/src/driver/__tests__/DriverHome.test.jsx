import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DriverHome from '../DriverHome.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    profile: vi.fn(),
    earnings: vi.fn(),
    notificationUnread: vi.fn(),
  },
}));

const mockProfile = {
  name: 'Rizky Driver',
  email: 'rizky@ojol.id',
  photo: 'https://example.com/avatar.png',
  verification_status: 'Verified',
};

beforeEach(() => {
  vi.clearAllMocks();
  driverAPI.profile.mockResolvedValue(mockProfile);
  driverAPI.earnings.mockResolvedValue({ balance: 120000 });
  driverAPI.notificationUnread.mockResolvedValue({ count: 0 });
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

  it('renders earnings section with formatted balance', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Saldo Hari Ini')).toBeInTheDocument();
      expect(screen.getByText('Rp 120.000')).toBeInTheDocument();
    });
  });

  it('renders quick actions menu', async () => {
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Menu Cepat')).toBeInTheDocument();
      expect(screen.getByText('Riwayat Perjalanan')).toBeInTheDocument();
    });
  });
});

describe('DriverHome — navigation', () => {
  it('Go Offline button calls onNavigate with driverOffline', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Offline')));
    expect(onNavigate).toHaveBeenCalledWith('driverOffline');
  });

  it('Trip History action calls onNavigate with trips', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Riwayat Perjalanan')));
    expect(onNavigate).toHaveBeenCalledWith('trips');
  });

  it('notifications bell calls onNavigate with notifications', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Riwayat Perjalanan')));
  });

  it('Detail Pendapatan calls onNavigate with earnings', async () => {
    const onNavigate = vi.fn();
    render(<DriverHome onNavigate={onNavigate} />);
    await waitFor(() => fireEvent.click(screen.getByText('Detail Pendapatan')));
    expect(onNavigate).toHaveBeenCalledWith('earnings');
  });
});

describe('DriverHome — API error', () => {
  it('shows error message on API failure', async () => {
    driverAPI.profile.mockRejectedValue(new Error('Network Error'));
    render(<DriverHome onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat/)).toBeInTheDocument());
  });
});
