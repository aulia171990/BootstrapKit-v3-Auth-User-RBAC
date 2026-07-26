import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DriverApp from '../DriverApp.jsx';
import { resetTripStore } from '../stores/tripStore.js';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    profile: vi.fn(),
    walletBalance: vi.fn(),
    driverStatus: vi.fn(),
    todayEarnings: vi.fn(),
    notificationUnread: vi.fn(),
    updateOnlineStatus: vi.fn(),
    activeTrip: vi.fn(),
    trips: vi.fn(),
    acceptOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    walletTransactions: vi.fn(),
  },
}));

const mockUser = { name: 'Rizky Driver', email: 'rizky@ojol.id', role: 'driver' };

beforeAll(() => {
  global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    set src(v) {},
    set loop(v) {},
  }));
});

describe('DriverApp', () => {
  beforeEach(() => {
    resetTripStore();
    vi.clearAllMocks();
    driverAPI.profile.mockResolvedValue(mockUser);
    driverAPI.walletBalance.mockResolvedValue(120000);
    driverAPI.driverStatus.mockResolvedValue({ isOnline: true, zone: 'Jakarta Pusat', todayTrips: 8, rating: 4.9, driverCode: 'DRV-001' });
    driverAPI.todayEarnings.mockResolvedValue({ total: 185000, trips: 8, bonus: 15000, cash: 45000 });
    driverAPI.notificationUnread.mockResolvedValue({ count: 2 });
    driverAPI.activeTrip.mockResolvedValue([]);
    driverAPI.trips.mockResolvedValue([]);
    driverAPI.walletTransactions.mockResolvedValue([]);
  });

  it('renders DriverHome by default', async () => {
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
  });

  it('navigates to trips tab', async () => {
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
    const navBtns = screen.getAllByText('Trips');
    fireEvent.click(navBtns[0].closest('button') || navBtns[0]);
    await waitFor(() => expect(screen.getByText('Riwayat Perjalanan')).toBeInTheDocument());
  });

  it('navigates to wallet tab', async () => {
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
    const navBtns = screen.getAllByText('Wallet');
    fireEvent.click(navBtns[0].closest('button') || navBtns[0]);
    await waitFor(() => expect(screen.getByText('Dompet')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Saldo/)).toBeInTheDocument());
  });

  it('navigates to earnings tab', async () => {
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
    const navBtns = screen.getAllByText('Earnings');
    fireEvent.click(navBtns[0].closest('button') || navBtns[0]);
    await waitFor(() => expect(screen.getAllByText('Pendapatan').length).toBeGreaterThanOrEqual(1));
  });

  it('navigates to profile tab', async () => {
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Rizky Driver')).toBeInTheDocument());
    const navBtns = screen.getAllByText('Profile');
    fireEvent.click(navBtns[0].closest('button') || navBtns[0]);
    await waitFor(() => expect(screen.getByText('Profil')).toBeInTheDocument());
  });

  it('redirects to active trip if one exists', async () => {
    driverAPI.activeTrip.mockResolvedValue([{
      id: 'TRIP-001', status: 'accepted',
      pickupLabel: 'Jl. Sudirman', destinationLabel: 'Jl. Thamrin',
      estimated_fare: 25000, distance: 3.2, payment_method: 'cash',
    }]);
    render(<DriverApp user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getAllByText(/Menuju Penumpang/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
