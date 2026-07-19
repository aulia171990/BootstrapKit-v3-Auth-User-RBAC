import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConnectionBanner from '../ConnectionBanner.jsx';
import TripSkeleton from '../TripSkeleton.jsx';
import { useTripConnection, retryConnection, onConnectionChange, setTripEcho, subscribeTrip, CONNECTION } from '../tripRealtime.js';
import TripInProgress from '../TripInProgress.jsx';

describe('ConnectionBanner (3C-3I)', () => {
  it('hidden when online', () => {
    const { container } = render(<ConnectionBanner connection={CONNECTION.ONLINE} onRetry={vi.fn()} />);
    expect(container.querySelector('.pasv-conn')).toBeNull();
  });
  it('shows offline + retry action', () => {
    const onRetry = vi.fn();
    render(<ConnectionBanner connection={CONNECTION.OFFLINE} onRetry={onRetry} />);
    expect(screen.getByText(/Koneksi terputus/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Coba lagi'));
    expect(onRetry).toHaveBeenCalled();
  });
  it('shows reconnecting state', () => {
    render(<ConnectionBanner connection={CONNECTION.RECONNECTING} onRetry={vi.fn()} />);
    expect(screen.getByText(/Menyambungkan kembali/)).toBeInTheDocument();
  });
});

describe('useTripConnection hook (3C-3I)', () => {
  it('reflects offline/online + retry transitions', () => {
    vi.useFakeTimers();
    function Probe() {
      const { connection } = useTripConnection();
      return <div data-testid="c">{connection}</div>;
    }
    const { getByTestId } = render(<Probe />);
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(getByTestId('c').textContent).toBe(CONNECTION.OFFLINE);
    act(() => { retryConnection(); });
    expect(getByTestId('c').textContent).toBe(CONNECTION.RECONNECTING);
    act(() => { vi.advanceTimersByTime(900); });
    expect(getByTestId('c').textContent).toBe(CONNECTION.ONLINE);
    vi.useRealTimers();
  });
});

describe('TripSkeleton (3C-3I)', () => {
  it('renders skeleton blocks', () => {
    const { container } = render(<TripSkeleton />);
    expect(container.querySelectorAll('.ds-skeleton').length).toBeGreaterThan(0);
  });
});

describe('TripInProgress loading (3C-3I)', () => {
  it('shows skeleton while loading, map when ready', () => {
    const { container, rerender } = render(<TripInProgress booking={{ id: 'bk' }} driver={{ name: 'A', vehicle: 'X', plate: 'B' }} loading />);
    expect(container.querySelector('.ds-skeleton')).toBeTruthy();
    rerender(<TripInProgress booking={{ id: 'bk' }} driver={{ name: 'A', vehicle: 'X', plate: 'B' }} />);
    expect(container.querySelector('.ds-skeleton')).toBeNull();
  });
});

describe('Realtime battery-friendly throttle (3C-3I)', () => {
  afterEach(() => setTripEcho(null));
  it('rate-limits TripProgress (THROTTLE_MS=2000)', () => {
    vi.useFakeTimers();
    const handler = vi.fn();
    const listeners = {};
    const fakeEcho = { private: () => ({ listen: (ev, cb) => { listeners[ev] = cb; }, stopListening: () => {} }) };
    setTripEcho(fakeEcho);
    subscribeTrip('bk', handler);
    const emit = listeners['.TripProgress'];
    act(() => { emit({ booking: { id: 'bk' } }); });
    act(() => { emit({ booking: { id: 'bk' } }); }); // within throttle window → dropped
    expect(handler).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { emit({ booking: { id: 'bk' } }); }); // after window → allowed
    expect(handler).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('onConnectionChange subscription (3C-3I)', () => {
  it('notifies listeners on state change', () => {
    const cb = vi.fn();
    const off = onConnectionChange(cb);
    retryConnection();
    expect(cb).toHaveBeenCalledWith(CONNECTION.RECONNECTING);
    off();
  });
});
