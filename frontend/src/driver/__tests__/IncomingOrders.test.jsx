import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncomingOrders from '../pages/IncomingOrders.jsx';

beforeAll(() => {
  global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    set src(v) {},
    set loop(v) {},
  }));
});

const mockOrder = {
  id: 'ORD-001',
  type: 'transport',
  pickupLabel: 'Jl. Sudirman No. 10',
  destinationLabel: 'Jl. Thamrin No. 25',
  estimated_fare: 25000,
  distance: 3.2,
  estimated_duration: 12,
  passenger: { name: 'Budi', rating: 4.8 },
  pickup_code: '1234',
};

describe('IncomingOrders', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders order details', async () => {
    render(<IncomingOrders order={mockOrder} onAccept={vi.fn()} onReject={vi.fn()} onTimeout={vi.fn()} />);
    expect(screen.getByText('Pesanan Baru!')).toBeInTheDocument();
    expect(screen.getByText(/Transport/)).toBeInTheDocument();
    expect(screen.getByText(/Jl. Sudirman No. 10/)).toBeInTheDocument();
    expect(screen.getByText(/Jl. Thamrin No. 25/)).toBeInTheDocument();
  });

  it('shows estimated fare', async () => {
    render(<IncomingOrders order={mockOrder} onAccept={vi.fn()} onReject={vi.fn()} onTimeout={vi.fn()} />);
    expect(screen.getByText(/25.000/)).toBeInTheDocument();
  });

  it('shows passenger info', async () => {
    render(<IncomingOrders order={mockOrder} onAccept={vi.fn()} onReject={vi.fn()} onTimeout={vi.fn()} />);
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });

  it('calls onAccept when Terima is clicked', async () => {
    const onAccept = vi.fn().mockResolvedValue();
    render(<IncomingOrders order={mockOrder} onAccept={onAccept} onReject={vi.fn()} onTimeout={vi.fn()} />);
    fireEvent.click(screen.getByText('Terima'));
    await waitFor(() => expect(onAccept).toHaveBeenCalledWith('ORD-001'));
  });

  it('calls onReject when Tolak is clicked', async () => {
    const onReject = vi.fn().mockResolvedValue();
    render(<IncomingOrders order={mockOrder} onAccept={vi.fn()} onReject={onReject} onTimeout={vi.fn()} />);
    fireEvent.click(screen.getByText('Tolak'));
    await waitFor(() => expect(onReject).toHaveBeenCalledWith('ORD-001'));
  });

  it('calls onTimeout after 30 seconds', async () => {
    const onTimeout = vi.fn();
    render(<IncomingOrders order={mockOrder} onAccept={vi.fn()} onReject={vi.fn()} onTimeout={onTimeout} />);
    vi.advanceTimersByTime(32000);
    await vi.waitFor(() => expect(onTimeout).toHaveBeenCalled());
  });

  it('renders nothing when no order', () => {
    const { container } = render(<IncomingOrders order={null} onAccept={vi.fn()} onReject={vi.fn()} onTimeout={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });
});
