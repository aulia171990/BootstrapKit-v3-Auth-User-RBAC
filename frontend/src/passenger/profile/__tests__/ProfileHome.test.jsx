import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileHome from '../ProfileHome.jsx';
import * as papi from '../../api.js';

const mockUser = { name: 'Budi Santoso', email: 'budi@ojol.test', phone: '62812345678' };
const noop = () => {};

afterEach(() => { vi.restoreAllMocks(); });

describe('ProfileHome', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(papi, 'getProfile').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(papi, 'getWallet').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(container.querySelector('.pasv-pro__skeleton')).toBeTruthy();
  });

  it('renders user info after loading', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi Santoso', email: 'budi@ojol.test', phone: '62812345678', avatar: null, verified: true, memberSince: '2024-01-01' });
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR' });
    render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(await screen.findByText('Budi Santoso')).toBeTruthy();
    expect(screen.getByText('budi@ojol.test')).toBeTruthy();
    expect(screen.getByText('Terverifikasi')).toBeTruthy();
  });

  it('renders wallet balance', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', verified: true, memberSince: '2024-01-01' });
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 125000, currency: 'IDR' });
    render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(await screen.findByText('Rp 125.000')).toBeTruthy();
    expect(screen.getByText('Saldo Dompet')).toBeTruthy();
  });

  it('renders quick action buttons', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', verified: true, memberSince: '2024-01-01' });
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 0, currency: 'IDR' });
    render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(await screen.findByText('Akses Cepat')).toBeTruthy();
    expect(screen.getByText('Data Diri')).toBeTruthy();
    expect(screen.getByText('Alamat')).toBeTruthy();
    expect(screen.getByText('Darurat')).toBeTruthy();
    expect(screen.getByText('Pembayaran')).toBeTruthy();
  });

  it('navigates on quick action click', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', verified: true, memberSince: '2024-01-01' });
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 0, currency: 'IDR' });
    const onNavigate = vi.fn();
    render(<ProfileHome user={mockUser} onNavigate={onNavigate} onLogout={noop} />);
    expect(await screen.findByText('Data Diri')).toBeTruthy();
    fireEvent.click(screen.getByText('Data Diri'));
    expect(onNavigate).toHaveBeenCalledWith('personalInfo');
  });

  it('renders settings sections', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', verified: true, memberSince: '2024-01-01' });
    vi.spyOn(papi, 'getWallet').mockResolvedValue({ balance: 0, currency: 'IDR' });
    render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(await screen.findByText('Preferensi')).toBeTruthy();
    expect(screen.getByText('Keamanan')).toBeTruthy();
    expect(screen.getByText('Notifikasi')).toBeTruthy();
    expect(screen.getByText('Ubah Password')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    vi.spyOn(papi, 'getProfile').mockRejectedValue(new Error('Network error'));
    render(<ProfileHome user={mockUser} onNavigate={noop} onLogout={noop} />);
    expect(await screen.findByText('Gagal memuat profil')).toBeTruthy();
  });
});
