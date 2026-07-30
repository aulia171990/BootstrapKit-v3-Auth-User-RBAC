import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Bookings from '../Bookings.jsx';
import { api } from '../../api.js';

const mockBookings = [
  { id: 'bk_1', customerName: 'Budi Santoso', driverName: 'Agus Prasetyo', status: 'completed', fare: 50000, date: new Date().toISOString(), pickup: 'Jl. Sudirman No.10', destination: 'Jl. Thamrin No.25' },
  { id: 'bk_2', customerName: 'Ani Susanti', driverName: null, status: 'pending', fare: 25000, date: new Date().toISOString(), pickup: 'Jl. Merdeka No.1', destination: 'Bandara Soetta' },
];

afterEach(() => { vi.restoreAllMocks(); });

describe('Bookings', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(api, 'bookings').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<Bookings />);
    expect(container.querySelector('.ds-skeleton')).toBeTruthy();
  });

  it('renders list of bookings', async () => {
    vi.spyOn(api, 'bookings').mockResolvedValue(mockBookings);
    render(<Bookings />);
    expect(await screen.findByText('Booking (2)')).toBeTruthy();
    expect(screen.getByText('Budi Santoso')).toBeTruthy();
    expect(screen.getByText('Agus Prasetyo')).toBeTruthy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
    expect(screen.getByText('Rp 50.000')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    vi.spyOn(api, 'bookings').mockRejectedValue(new Error('Network error'));
    render(<Bookings />);
    expect(await screen.findByText('Gagal memuat data booking')).toBeTruthy();
  });

  it('filters bookings by search query', async () => {
    vi.spyOn(api, 'bookings').mockResolvedValue(mockBookings);
    render(<Bookings />);
    await screen.findByText('Budi Santoso');
    
    const searchInput = screen.getByPlaceholderText('Cari ID, pelanggan, driver, atau rute...');
    fireEvent.change(searchInput, { target: { value: 'Ani' } });
    
    expect(screen.queryByText('Budi Santoso')).toBeFalsy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
    expect(screen.getByText('Booking (1)')).toBeTruthy();
  });

  it('filters bookings by status', async () => {
    vi.spyOn(api, 'bookings').mockResolvedValue(mockBookings);
    render(<Bookings />);
    await screen.findByText('Budi Santoso');
    
    fireEvent.click(screen.getByRole('button', { name: 'Menunggu' }));
    expect(screen.queryByText('Budi Santoso')).toBeFalsy();
    expect(screen.getByText('Ani Susanti')).toBeTruthy();
  });

  it('handles cancelling a booking', async () => {
    vi.spyOn(api, 'bookings').mockResolvedValue(mockBookings);
    render(<Bookings />);
    await screen.findByText('Ani Susanti'); // Ensure pending booking is rendered
    
    const cancelBtn = screen.getByTitle('Batalkan');
    fireEvent.click(cancelBtn);
    
    expect(await screen.findByText('Dibatalkan')).toBeTruthy();
  });

  it('navigates to booking details', async () => {
    vi.spyOn(api, 'bookings').mockResolvedValue(mockBookings);
    const onNavigate = vi.fn();
    render(<Bookings onNavigate={onNavigate} />);
    await screen.findByText('Budi Santoso');
    
    const detailBtns = screen.getAllByTitle('Detail');
    fireEvent.click(detailBtns[0]);
    expect(onNavigate).toHaveBeenCalledWith('bookingDetail', 'bk_1');
  });
});
