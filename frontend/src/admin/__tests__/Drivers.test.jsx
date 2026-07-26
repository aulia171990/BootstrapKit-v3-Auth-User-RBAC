import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Drivers from '../Drivers.jsx';
import { api } from '../../api.js';

const mockDrivers = [
  { id: 'drv_1', name: 'Agus Prasetyo', email: 'agus@ojol.test', phone: '08123', status: 'active', vehicleType: 'Motor', vehiclePlate: 'B 1234 XYZ', rating: 4.8, totalTrips: 100, kycVerified: true },
  { id: 'drv_2', name: 'Bayu Saputra', email: 'bayu@ojol.test', phone: '08124', status: 'pending', vehicleType: 'Mobil', vehiclePlate: 'B 5678 ABC', rating: null, totalTrips: 0, kycVerified: false },
];

afterEach(() => { vi.restoreAllMocks(); });

describe('Drivers', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(api, 'drivers').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<Drivers />);
    expect(container.querySelector('.ds-skeleton')).toBeTruthy();
  });

  it('renders list of drivers', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    render(<Drivers />);
    expect(await screen.findByText('Driver (2)')).toBeTruthy();
    expect(screen.getByText('Agus Prasetyo')).toBeTruthy();
    expect(screen.getByText('Bayu Saputra')).toBeTruthy();
    expect(screen.getByText('Motor · B 1234 XYZ')).toBeTruthy();
    expect(screen.getByText('Mobil · B 5678 ABC')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    vi.spyOn(api, 'drivers').mockRejectedValue(new Error('Network error'));
    render(<Drivers />);
    expect(await screen.findByText('Gagal memuat data driver')).toBeTruthy();
  });

  it('filters drivers by search query', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    render(<Drivers />);
    await screen.findByText('Agus Prasetyo');
    
    const searchInput = screen.getByPlaceholderText('Cari nama, email, telepon, atau plat...');
    fireEvent.change(searchInput, { target: { value: 'Bayu' } });
    
    expect(screen.queryByText('Agus Prasetyo')).toBeFalsy();
    expect(screen.getByText('Bayu Saputra')).toBeTruthy();
    expect(screen.getByText('Driver (1)')).toBeTruthy();
  });

  it('filters drivers by status', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    render(<Drivers />);
    await screen.findByText('Agus Prasetyo');
    
    fireEvent.click(screen.getByRole('button', { name: 'Menunggu' }));
    expect(screen.queryByText('Agus Prasetyo')).toBeFalsy();
    expect(screen.getByText('Bayu Saputra')).toBeTruthy();
  });

  it('handles verification of pending driver correctly', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    render(<Drivers />);
    await screen.findByText('Bayu Saputra');
    
    const verifyBtn = screen.getByTitle('Verifikasi');
    fireEvent.click(verifyBtn);
    
    expect(await screen.findByText('Terverifikasi')).toBeTruthy();
  });

  it('handles status toggle correctly', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    render(<Drivers />);
    await screen.findByText('Agus Prasetyo');
    
    const tangguhkanBtn = screen.getByTitle('Tangguhkan');
    fireEvent.click(tangguhkanBtn);
    
    expect(await screen.findByText('Ditangguhkan')).toBeTruthy();
  });

  it('navigates to driver details', async () => {
    vi.spyOn(api, 'drivers').mockResolvedValue(mockDrivers);
    const onNavigate = vi.fn();
    render(<Drivers onNavigate={onNavigate} />);
    await screen.findByText('Agus Prasetyo');
    
    const detailBtns = screen.getAllByTitle('Detail');
    fireEvent.click(detailBtns[0]);
    expect(onNavigate).toHaveBeenCalledWith('driverDetail', 'drv_1');
  });
});
