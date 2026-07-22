import { api, getToken, setToken, clearToken } from '../api.js';

export { getToken, setToken, clearToken };

export const driverAPI = {
  profile: () => api.me(),
  earnings: () => api.walletBalance(),
  activeTrip: () => api.trips('status=in_progress&limit=1'),
  trips: (params) => api.trips(params),
  orderTrack: (id) => api.orderTrack(id),
  notifications: () => api.notifications(),
  notificationUnread: () => api.notificationUnread(),
};
