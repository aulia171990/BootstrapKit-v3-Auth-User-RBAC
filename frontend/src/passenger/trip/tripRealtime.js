import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Trip Realtime client (3C) — reusable across Waiting Driver (3A), Driver
 * Assigned (3B), Arriving (3C), In Progress (3D) and later trip screens.
 *
 * CONTRACT (events the trip screens subscribe to):
 *   - BookingAccepted   { booking }            booking created/accepted by system
 *   - DriverAssigned    { booking, driver }    a driver took the order  → 3B
 *   - DriverArriving    { booking, driver }    driver reached pickup    → 3C
 *   - PickupConfirmed   { booking, driver }    passenger confirmed pickup → 3D
 *   - TripProgress      { booking, driver, distanceKm, etaMin, progress, position }  in-progress telemetry → 3D
 *   - TripCompleted     { booking, fare }       trip finished           → 3G
 *   - DispatchRetry     { attempt, nextEtaSec } system retrying dispatch
 *   - BookingCancelled  { reason }             cancelled by passenger/system
 *   - BookingExpired    {}                      no driver found in time (→ Timeout)
 *
 * TRANSPORT
 *   When the backend ships a Reverb/Echo channel, set `getEcho()` to a
 *   configured `new Echo({...})`. The hook will subscribe to
 *   `echo.private('booking.{id}')` and forward the events above. Until then it
 *   uses a deterministic MOCK simulator so the screens are fully testable and
 *   demonstrable without a backend (consistent with the rest of the passenger
 *   app, which runs on sample data). This avoids fabricating fetch URLs or
 *   duplicating backend business logic.
 *
 * No business logic is duplicated here — it only translates transport events
 * into the trip event contract.
 */

// Pluggable Echo instance (optional). Wire this up when the backend is ready.
let _echo = null;
export function setTripEcho(echo) { _echo = echo; }
export function getTripEcho() { return _echo; }

const EVENTS = ['BookingAccepted', 'DriverAssigned', 'DriverArriving', 'PickupConfirmed', 'TripProgress', 'TripCompleted', 'DispatchRetry', 'BookingCancelled', 'BookingExpired'];

/**
 * Subscribe to trip events for a booking id.
 * @param {string} bookingId
 * @param {(event:string, payload:object)=>void} handler
 * @returns {()=>void} unsubscribe
 */
export function subscribeTrip(bookingId, handler) {
  const echo = getTripEcho();
  if (echo && bookingId) {
    const ch = echo.private(`booking.${bookingId}`);
    EVENTS.forEach((ev) => ch.listen(`.${ev}`, (p) => handler(ev, p)));
    return () => EVENTS.forEach((ev) => ch.stopListening(`.${ev}`));
  }
  // Mock simulator (deterministic, testable). Emits DispatchRetry then
  // DriverAssigned after `assignInMs`, or Expired if `expireInMs` is set.
  let cancelled = false;
  const timers = [];
  const emit = (ev, p) => { if (!cancelled) handler(ev, p); };
  emit('BookingAccepted', { booking: { id: bookingId } });
  if (typeof globalThis !== 'undefined') {
    timers.push(setTimeout(() => emit('DispatchRetry', { attempt: 1, nextEtaSec: 30 }), 4000));
    timers.push(setTimeout(() => emit('DriverAssigned', { booking: { id: bookingId }, driver: MOCK_DRIVER }), 9000));
    // Driver reaches the pickup point a bit later → 3C transition.
    timers.push(setTimeout(() => emit('DriverArriving', { booking: { id: bookingId }, driver: MOCK_DRIVER }), 15000));
    // Passenger confirms pickup → 3D transition.
    timers.push(setTimeout(() => emit('PickupConfirmed', { booking: { id: bookingId }, driver: MOCK_DRIVER }), 17000));
    // In-progress telemetry (3D): a few progress pings.
    [19000, 21000, 23000].forEach((at, i) => {
      const p = (i + 1) / 3;
      timers.push(setTimeout(() => emit('TripProgress', {
        booking: { id: bookingId }, driver: MOCK_DRIVER,
        distanceKm: +(0.4 * (1 - p)).toFixed(2), etaMin: Math.max(1, Math.round(3 * (1 - p))),
        progress: Math.round(p * 100), position: [40 + i * 15, 50 - i * 10],
      }), at));
    });
    // Trip finished (3G) — backend will own this; here it's the natural end.
    timers.push(setTimeout(() => emit('TripCompleted', { booking: { id: bookingId }, fare: 38500 }), 25000));
  }
  return () => { cancelled = true; timers.forEach(clearTimeout); };
}

const MOCK_DRIVER = {
  id: 'dr1', name: 'Anto', vehicle: 'Honda Vario 150', plate: 'B 1234 ANT',
  rating: 4.9, etaMin: 3, distanceKm: 0.4,
};

/**
 * React hook: subscribe to the trip channel and expose the latest event.
 * @param {string} bookingId
 */
export function useTripRealtime(bookingId) {
  const [event, setEvent] = useState(null); // { type, payload }
  const handlerRef = useRef();
  const onEvent = useCallback((type, payload) => setEvent({ type, payload }), []);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!bookingId) return undefined;
    const off = subscribeTrip(bookingId, (type, payload) => handlerRef.current(type, payload));
    return off;
  }, [bookingId]);

  return event;
}
