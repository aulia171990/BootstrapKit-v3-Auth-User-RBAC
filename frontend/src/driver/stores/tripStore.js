import { driverAPI } from '../driver-api.js';

let _trips = [];
let _activeTrip = null;
let _loading = false;
let _listeners = [];

function notify() { _listeners.forEach((fn) => fn()); }

export function resetTripStore() { _trips = []; _activeTrip = null; _loading = false; _listeners = []; }

export const tripStore = {
  subscribe(fn) { _listeners.push(fn); return () => { _listeners = _listeners.filter((f) => f !== fn); }; },
  getSnapshot() { return { trips: _trips, activeTrip: _activeTrip, loading: _loading }; },
  get trips() { return _trips; },
  get activeTrip() { return _activeTrip; },
  async loadTrips(params = 'per_page=20&sort=desc') {
    _loading = true; notify();
    const data = await driverAPI.trips(params);
    _trips = Array.isArray(data) ? data : data?.data || [];
    _loading = false; notify();
    return _trips;
  },
  async loadActiveTrip() {
    const data = await driverAPI.activeTrip();
    _activeTrip = Array.isArray(data) && data.length ? data[0] : null;
    notify();
    return _activeTrip;
  },
  async acceptOrder(id) {
    try {
      const res = await driverAPI.acceptOrder(id);
      await this.loadActiveTrip();
      return res;
    } catch {
      _activeTrip = { id, status: 'accepted' };
      notify();
      return _activeTrip;
    }
  },
  async updateStatus(id, status) {
    const res = await driverAPI.updateOrderStatus(id, status);
    if (status === 'completed' || status === 'cancelled') _activeTrip = null;
    else await this.loadActiveTrip();
    notify();
    return res;
  },
};
