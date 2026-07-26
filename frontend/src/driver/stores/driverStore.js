import { driverAPI } from '../driver-api.js';

let _driver = null;
let _online = true;
let _listeners = [];

function notify() { _listeners.forEach((fn) => fn()); }

export const driverStore = {
  subscribe(fn) { _listeners.push(fn); return () => { _listeners = _listeners.filter((f) => f !== fn); }; },
  getSnapshot() { return _driver; },
  get online() { return _online; },
  get driver() { return _driver; },
  setOnline(v) { _online = v; notify(); },
  async load() {
    const data = await driverAPI.driverStatus();
    _driver = data;
    _online = data.isOnline;
    notify();
    return data;
  },
  async toggleOnline() {
    const next = !_online;
    _online = next;
    notify();
    try {
      await driverAPI.updateOnlineStatus(next ? 'online' : 'offline');
    } catch { _online = !next; notify(); }
    return _online;
  },
};
