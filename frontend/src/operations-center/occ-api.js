import { getToken } from '../api.js';

async function req(path, opts = {}) {
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...(opts.headers || {}),
  };
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch('/api/v1' + path, { ...opts, headers, credentials: 'same-origin' });
  if (res.status === 401) throw new Error('Unauthorized');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data.data ?? data;
}

export const occApi = {
  dashboard: () => req('/operations/dashboard'),
  incidents: () => req('/operations/incidents'),
  storeIncident: (payload) => req('/operations/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  updateIncident: (id, payload) => req('/operations/incidents/' + id, { method: 'PUT', body: JSON.stringify(payload) }),
  sosAlerts: () => req('/operations/sos'),
  alerts: () => req('/operations/alerts'),
  manualDispatch: (payload) => req('/operations/manual-dispatch', { method: 'POST', body: JSON.stringify(payload) }),
  reassignDriver: (payload) => req('/operations/reassign-driver', { method: 'POST', body: JSON.stringify(payload) }),
  forceDriverOffline: (payload) => req('/operations/driver/offline', { method: 'POST', body: JSON.stringify(payload) }),

  analyticsDashboard: () => req('/analytics/dashboard'),
  analyticsKPI: () => req('/analytics/kpi'),
  analyticsRevenue: () => req('/analytics/revenue'),
  analyticsTrips: () => req('/analytics/trips'),

  dispatchJobs: () => req('/dispatch/jobs'),
  dispatchHistory: () => req('/dispatch/history'),
  startDispatch: (bookingId) => req('/dispatch/' + bookingId, { method: 'POST' }),
  cancelDispatch: (jobId) => req('/dispatch/' + jobId + '/cancel', { method: 'POST' }),
  retryDispatch: (jobId) => req('/dispatch/' + jobId + '/retry', { method: 'POST' }),

  adminStats: () => req('/admin/dashboard/stats'),
  adminAlerts: () => req('/admin/dashboard/alerts'),
  adminHealth: () => req('/admin/dashboard/health'),
  liveTrips: () => req('/admin/support/live-trips'),

  drivers: () => req('/drivers'),
  driver: (id) => req('/drivers/' + id),
  driverLocation: (id) => req('/drivers/' + id + '/location'),
  forceOnline: (id) => req('/drivers/' + id + '/online', { method: 'POST' }),
  forceOffline: (id) => req('/drivers/' + id + '/offline', { method: 'POST' }),
};
