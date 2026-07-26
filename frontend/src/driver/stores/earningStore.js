import { driverAPI } from '../driver-api.js';

let _state = { today: null, weekly: null, monthly: null, balance: null, loading: false };

let _listeners = [];

function notify() { _listeners.forEach((fn) => fn()); }

export const earningStore = {
  subscribe(fn) { _listeners.push(fn); return () => { _listeners = _listeners.filter((f) => f !== fn); }; },
  getSnapshot() { return _state; },
  get state() { return _state; },
  async loadAll() {
    _state = { ..._state, loading: true }; notify();
    const [today, weekly, monthly, balance] = await Promise.all([
      driverAPI.todayEarnings().catch(() => null),
      driverAPI.weeklyEarnings().catch(() => null),
      driverAPI.monthlyEarnings().catch(() => null),
      driverAPI.walletBalance().catch(() => null),
    ]);
    _state = { today, weekly, monthly, balance: balance?.balance ?? balance, loading: false };
    notify();
    return _state;
  },
};
