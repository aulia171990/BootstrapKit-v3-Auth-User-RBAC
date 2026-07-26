import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Customers from '../Customers.jsx';
import { api } from '../../api.js';

const mockCustomers = [
  { id: 'usr_1', name: 'Budi Santoso', email: 'budi@test.com', phone: '08123', status: 'active', totalTrips: 10, totalSpent: 50000, emailVerified: true, kycVerified: true },
  { id: 'usr_2', name: 'Ani Susanti', email: 'ani@test.com', phone: '08124', status: 'suspended', totalTrips: 0, totalSpent: 0, emailVerified: false, kycVerified: false },
];

afterEach(() => { vi.restoreAllMocks(); });

describe('Customers', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(api, 'customers').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<Customers />);
    expect(container.querySelector('.ds-skeleton')).toBeTruthy();
  });

  it('renders list of customers', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    render(<Customers />);
    expect(await screen.findByText('Pelanggan (2)')).toBeTruthy();
    expect(screen.getByText('Budi Santoso')).toBeTruthy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
    expect(screen.getByText('budi@test.com')).toBeTruthy();
    expect(screen.getByText('Rp 50.000')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    vi.spyOn(api, 'customers').mockRejectedValue(new Error('Network error'));
    render(<Customers />);
    expect(await screen.findByText('Gagal memuat data pelanggan')).toBeTruthy();
  });

  it('filters customers by search query', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    render(<Customers />);
    await screen.findByText('Budi Santoso');
    
    const searchInput = screen.getByPlaceholderText('Cari nama, email, atau telepon...');
    fireEvent.change(searchInput, { target: { value: 'Ani' } });
    
    expect(screen.queryByText('Budi Santoso')).toBeFalsy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
    expect(screen.getByText('Pelanggan (1)')).toBeTruthy();
  });

  it('shows empty state when no results found', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    render(<Customers />);
    await screen.findByText('Budi Santoso');
    
    const searchInput = screen.getByPlaceholderText('Cari nama, email, atau telepon...');
    fireEvent.change(searchInput, { target: { value: 'Zzzz' } });
    
    expect(screen.getByText('Tidak ada hasil')).toBeTruthy();
  });

  it('filters customers by status', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    render(<Customers />);
    await screen.findByText('Budi Santoso');
    
    fireEvent.click(screen.getByRole('button', { name: 'Ditangguhkan' }));
    expect(screen.queryByText('Budi Santoso')).toBeFalsy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
  });

  it('handles status toggle correctly', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    render(<Customers />);
    await screen.findByText('Budi Santoso');
    
    const tangguhkanBtn = screen.getByTitle('Tangguhkan');
    fireEvent.click(tangguhkanBtn);
    
    await waitFor(() => expect(screen.getByTitle('Aktifkan')).toBeTruthy());
  });

  it('navigates to customer details', async () => {
    vi.spyOn(api, 'customers').mockResolvedValue(mockCustomers);
    const onNavigate = vi.fn();
    render(<Customers onNavigate={onNavigate} />);
    await screen.findByText('Budi Santoso');
    
    const detailBtns = screen.getAllByTitle('Detail');
    fireEvent.click(detailBtns[0]);
    expect(onNavigate).toHaveBeenCalledWith('customerDetail', 'usr_2');
  });
});
