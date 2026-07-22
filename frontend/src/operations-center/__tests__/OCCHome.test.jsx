import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OCCHome from '../OCCHome.jsx';

vi.mock('../occ-api.js', () => ({
  occApi: {
    dashboard: vi.fn(),
    sosAlerts: vi.fn(),
    alerts: vi.fn(),
  },
}));

import { occApi } from '../occ-api.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OCCHome', () => {
  it('renders loading skeleton state', () => {
    vi.mocked(occApi.dashboard).mockReturnValue(new Promise(() => {}));
    vi.mocked(occApi.sosAlerts).mockReturnValue(new Promise(() => {}));
    vi.mocked(occApi.alerts).mockReturnValue(new Promise(() => {}));
    render(<OCCHome onNavigate={vi.fn()} />);
    expect(document.querySelector('.ds-skeleton')).toBeTruthy();
  });

  it('renders KPI cards after loading', async () => {
    vi.mocked(occApi.dashboard).mockResolvedValue({
      onlineDrivers: 25, busyDrivers: 8, activeTrips: 10,
      completedToday: 50, cancelledToday: 2, avgResponseTime: 3.5,
      pendingDispatch: 1, incidents: 0,
    });
    vi.mocked(occApi.sosAlerts).mockResolvedValue([]);
    vi.mocked(occApi.alerts).mockResolvedValue([]);

    render(<OCCHome onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText('Driver Online')).toBeInTheDocument();
    expect(screen.getByText('Driver Sibuk')).toBeInTheDocument();
  });

  it('renders fallback data on API error', async () => {
    vi.mocked(occApi.dashboard).mockRejectedValue(new Error('fail'));
    vi.mocked(occApi.sosAlerts).mockRejectedValue(new Error('fail'));
    vi.mocked(occApi.alerts).mockRejectedValue(new Error('fail'));

    render(<OCCHome onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText('32').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows SOS section when there are active SOS alerts', async () => {
    vi.mocked(occApi.dashboard).mockResolvedValue({ sosAlerts: 1 });
    vi.mocked(occApi.sosAlerts).mockResolvedValue([
      { id: 1, driver_id: 'AG-1234', message: 'Emergency', created_at: new Date().toISOString() },
    ]);
    vi.mocked(occApi.alerts).mockResolvedValue([]);

    render(<OCCHome onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('SOS Darurat')).toBeInTheDocument();
    });
  });

  it('calls onNavigate when quick action is clicked', async () => {
    vi.mocked(occApi.dashboard).mockResolvedValue({});
    vi.mocked(occApi.sosAlerts).mockResolvedValue([]);
    vi.mocked(occApi.alerts).mockResolvedValue([]);

    const onNavigate = vi.fn();
    render(<OCCHome onNavigate={onNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Buat Insiden')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Buat Insiden'));
    expect(onNavigate).toHaveBeenCalledWith('incidents');
  });

  it('has refresh button', async () => {
    vi.mocked(occApi.dashboard).mockResolvedValue({});
    vi.mocked(occApi.sosAlerts).mockResolvedValue([]);
    vi.mocked(occApi.alerts).mockResolvedValue([]);

    render(<OCCHome onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Muat ulang')).toBeInTheDocument();
    });
  });
});
