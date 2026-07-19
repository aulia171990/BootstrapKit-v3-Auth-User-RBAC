import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  subscribeTrip, useTripRealtime, setTripEcho, getTripEcho,
} from '../tripRealtime.js';

afterEach(() => { setTripEcho(null); });

describe('tripRealtime (3C) — event contract + mock', () => {
  it('emits BookingAccepted then DriverAssigned via mock simulator', async () => {
    vi.useFakeTimers();
    const handler = vi.fn();
    const off = subscribeTrip('BK1', handler);
    // BookingAccepted is emitted synchronously
    expect(handler).toHaveBeenCalledWith('BookingAccepted', expect.objectContaining({ booking: { id: 'BK1' } }));
    await vi.advanceTimersByTimeAsync(9500);
    expect(handler).toHaveBeenCalledWith('DriverAssigned', expect.objectContaining({ driver: expect.anything() }));
    off();
    vi.useRealTimers();
  });

  it('uses Echo when configured (no mock timers)', () => {
    const listen = vi.fn();
    const stopListening = vi.fn();
    const fakeChannel = { listen, stopListening };
    const echo = { private: vi.fn(() => fakeChannel) };
    setTripEcho(echo);
    const handler = vi.fn();
    const off = subscribeTrip('BK2', handler);
    expect(echo.private).toHaveBeenCalledWith('booking.BK2');
    expect(listen).toHaveBeenCalledTimes(9); // all 9 contract events
    expect(getTripEcho()).toBe(echo);
    off();
    expect(stopListening).toHaveBeenCalledTimes(9);
  });

  it('useTripRealtime hook forwards events', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTripRealtime('BK3'));
    await vi.advanceTimersByTimeAsync(200);
    expect(result.current).toEqual(expect.objectContaining({ type: 'BookingAccepted' }));
    expect(result.current.payload.booking.id).toBe('BK3');
    vi.useRealTimers();
  });
});
