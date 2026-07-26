import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardHome from '../DashboardHome.jsx';
import { api } from '../../api.js';

const mockStats = {
  activeDrivers: 50, onlineDrivers: 40, activeTrips: 15, completedTripsToday: 100,
  cancelledTrips: 5, revenueToday: 30000000, bookingsToday: 130, avgEta: 4.5,
  customerSatisfaction: 4.8,
  tripsInProgress: 15, driversWaiting: 10, pendingDispatch: 2, sosAlerts: 0, incidents: 1,
  revenueTrend: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 300],
  bookingTrend: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 130],
  activeDriversTrend: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 50],
  activeTripsTrend: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15],
};

afterEach(() => { vi.restoreAllMocks(); });

describe('DashboardHome', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(api, 'dashboardStats').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<DashboardHome />);
    expect(container.querySelector('.admin-kpi-grid')).toBeTruthy();
    expect(container.querySelectorAll('.ds-skeleton')).toHaveLength(18);
  });

  it('renders KPI cards with data after loading', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Driver Aktif')).toBeTruthy();
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1); // activeDrivers
    expect(screen.getByText('Trip Selesai')).toBeTruthy();
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(1); // completedTripsToday
    expect(screen.getByText('Revenue Hari Ini')).toBeTruthy();
    expect(screen.getByText('Rp 30.000.000')).toBeTruthy();
  });

  it('renders Live Operations section', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Operasi Langsung')).toBeTruthy();
    expect(screen.getByText('Trip Berlangsung')).toBeTruthy();
    expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1); // tripsInProgress
    expect(screen.getByText('SOS Alert')).toBeTruthy();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1); // sosAlerts
  });

  it('renders Revenue Summary section with sparkline', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Ringkasan Revenue')).toBeTruthy();
    expect(screen.getByText(/Revenue Bulan Ini/)).toBeTruthy();
    expect(screen.getByText(/Rp 900.000.000/)).toBeTruthy(); // 30M * 30
    expect(screen.getByText(/\+200%/)).toBeTruthy(); // (300/100)*100-100 = 200
    expect(screen.getByLabelText('Trend sparkline')).toBeTruthy();
  });

  it('renders Summary Grid section', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Ringkasan Layanan')).toBeTruthy();
    expect(screen.getByText('Total Booking')).toBeTruthy();
    expect(screen.getAllByText('130').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pelanggan')).toBeTruthy();
    expect(screen.getByText('1,247')).toBeTruthy(); // static from component
  });

  it('renders Recent Alerts section', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Notifikasi & Alert')).toBeTruthy();
    expect(screen.getByText('SOS from driver AG-1234')).toBeTruthy();
    expect(screen.getAllByText('2m ago').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Recent Activities section', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    expect(await screen.findByText('Aktivitas Terbaru')).toBeTruthy();
    expect(screen.getByText('Budi Santoso')).toBeTruthy();
    expect(screen.getAllByText('mendaftar sebagai').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Driver').length).toBeGreaterThanOrEqual(1);
  });

  it('shows error state when API fails', async () => {
    vi.spyOn(api, 'dashboardStats').mockRejectedValue(new Error('Network error'));
    render(<DashboardHome />);
    expect(await screen.findByText('Gagal memuat dashboard')).toBeTruthy();
    expect(screen.getByText('Tidak dapat terhubung ke server. Periksa koneksi Anda.')).toBeTruthy();
  });

  it('shows offline state when navigator is offline', async () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    vi.spyOn(api, 'dashboardStats').mockRejectedValue(new Error('Offline')); // Simulate rejection in offline
    render(<DashboardHome />);
    expect(await screen.findByText('Mode offline')).toBeTruthy();
    expect(screen.getByText('Data dashboard tidak tersedia saat offline.')).toBeTruthy();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => original });
  });

  it('calls load on refresh button click', async () => {
    const loadSpy = vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    render(<DashboardHome />);
    await screen.findByText('Ringkasan Hari Ini');
    fireEvent.click(screen.getByText('Muat ulang'));
    expect(loadSpy).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('navigates to payments on "Lihat Semua" click in Revenue Summary', async () => {
    vi.spyOn(api, 'dashboardStats').mockResolvedValue(mockStats);
    const onNavigate = vi.fn();
    render(<DashboardHome onNavigate={onNavigate} />);
    await screen.findByText('Ringkasan Revenue');
    fireEvent.click(screen.getByText('Lihat Semua'));
    expect(onNavigate).toHaveBeenCalledWith('payments');
  });
});
