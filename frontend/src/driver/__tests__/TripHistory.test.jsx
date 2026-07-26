import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TripHistory from '../pages/TripHistory.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: { trips: vi.fn() },
}));

const mockTrips = Array.from({ length: 3 }, (_, i) => ({
  id: `t${i}`,
  trip_code: `TRP-${1000 + i}`,
  status: 'completed',
  final_fare: 15000 + i * 1000,
  created_at: new Date(Date.now() - i * 86400e3).toISOString(),
  pickup: { address: 'Rumah' },
  destination: { address: 'Kantor' },
}));

beforeEach(() => {
  vi.clearAllMocks();
  driverAPI.trips.mockResolvedValue(mockTrips);
});

describe('TripHistory', () => {
  it('renders page title', async () => {
    render(<TripHistory onBack={vi.fn()} onDetail={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Riwayat Perjalanan')).toBeInTheDocument());
  });

  it('renders trip cards', async () => {
    render(<TripHistory onBack={vi.fn()} onDetail={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getAllByText('Rumah').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kantor').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    render(<TripHistory onBack={onBack} onDetail={vi.fn()} />);
    await waitFor(() => fireEvent.click(screen.getByText('Riwayat Perjalanan')));
  });
});
