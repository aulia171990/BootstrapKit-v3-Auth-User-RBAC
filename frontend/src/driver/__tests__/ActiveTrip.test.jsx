import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActiveTrip from '../pages/ActiveTrip.jsx';

const mockTrip = {
  id: 'TRIP-001',
  status: 'accepted',
  type: 'transport',
  pickupLabel: 'Jl. Sudirman No. 10',
  destinationLabel: 'Jl. Thamrin No. 25',
  estimated_fare: 25000,
  distance: 3.2,
  payment_method: 'cash',
  pickup_code: '1234',
};

describe('ActiveTrip', () => {
  it('renders trip info', () => {
    render(<ActiveTrip trip={mockTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getAllByText(/Menuju Penumpang/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Jl. Sudirman No. 10/)).toBeInTheDocument();
    expect(screen.getByText(/Jl. Thamrin No. 25/)).toBeInTheDocument();
  });

  it('shows "Saya Sudah Sampai" button when accepted', () => {
    render(<ActiveTrip trip={mockTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByText('Saya Sudah Sampai')).toBeInTheDocument();
  });

  it('shows verification input when arrived', () => {
    const arrivedTrip = { ...mockTrip, status: 'arrived' };
    render(<ActiveTrip trip={arrivedTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByPlaceholderText('Masukkan kode pickup')).toBeInTheDocument();
  });

  it('shows "Mulai Perjalanan" when arrived', () => {
    const arrivedTrip = { ...mockTrip, status: 'arrived' };
    render(<ActiveTrip trip={arrivedTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByText('Lewati verifikasi (Mulai Perjalanan)')).toBeInTheDocument();
  });

  it('shows "Selesai" button when in_progress', () => {
    const inProgressTrip = { ...mockTrip, status: 'in_progress' };
    render(<ActiveTrip trip={inProgressTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByText('Selesai')).toBeInTheDocument();
  });

  it('shows completion card when completed', () => {
    const completedTrip = { ...mockTrip, status: 'completed' };
    render(<ActiveTrip trip={completedTrip} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByText('Trip Selesai')).toBeInTheDocument();
  });

  it('shows empty state when no trip', () => {
    render(<ActiveTrip trip={null} onBack={vi.fn()} onUpdate={vi.fn()} />);
    expect(screen.getByText('Tidak ada trip aktif')).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn();
    render(<ActiveTrip trip={mockTrip} onBack={onBack} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByText('Saya Sudah Sampai'));
    fireEvent.click(document.querySelector('.drv-page-back'));
    expect(onBack).toHaveBeenCalled();
  });
});
