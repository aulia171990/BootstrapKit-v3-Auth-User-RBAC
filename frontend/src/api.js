// Thin API client: token disimpan di localStorage, header Bearer otomatis.
const TOKEN_KEY = 'ojol_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

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
  const res = await fetch('/api/v1' + path, {
    ...opts,
    headers,
    credentials: 'same-origin',
  });
  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data.data ?? data;
}

export const api = {
  login: (email, password) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/auth/me'),
  orders: () => req('/orders'),
  order: (id) => req('/orders/' + id),
  drivers: () => req('/drivers'),
  driver: (id) => req('/drivers/' + id),
  dashboardStats: () => req('/admin/dashboard/stats'),
  payments: () => req('/admin/payments'),
  trips: () => req('/admin/trips'),
  customers: () => req('/admin/customers'),
  createOrder: (p) => req('/orders', { method: 'POST', body: JSON.stringify(p) }),
  acceptOrder: (id) => req('/orders/' + id + '/accept', { method: 'POST' }),
  updateStatus: (id, status) => req('/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateLocation: (id, p) => req('/orders/' + id + '/location', { method: 'POST', body: JSON.stringify(p) }),
  pay: (id, method) => req('/orders/' + id + '/pay', { method: 'POST', body: JSON.stringify({ method }) }),

  // ── Wallet module ──
  walletBalance: () => req('/wallet/balance'),
  walletTransactions: (limit) => req('/wallet/transactions' + (limit ? `?limit=${limit}` : '')),
  walletTopup: (amount) => req('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }),

  // ── Payment module ──
  paymentMethods: () => req('/payment/methods'),

  // ── Promotion module ──
  promotions: () => req('/promotions'),

  // ── Notification module ──
  notifications: (params = '') => req('/notification/notifications' + (params ? `?${params}` : '')),
  notificationUnread: () => req('/notification/notifications/unread'),
  notificationMarkRead: (ids) => req('/notification/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) }),
  notificationMarkAllRead: () => req('/notification/notifications/read-all', { method: 'POST' }),
  notificationPreferences: () => req('/notification/preferences'),
  notificationUpdatePreferences: (prefs) => req('/notification/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),

  // ── Trip / Booking module (passenger activity) ──
  trips: (params = '') => req('/trips' + (params ? `?${params}` : '')),
  trip: (id) => req('/trips/' + id),
  bookingsHistory: (params = '') => req('/bookings/history' + (params ? `?${params}` : '')),
  bookingTrack: (id) => req('/bookings/' + id + '/track'),
  orderTrack: (id) => req('/orders/' + id + '/track'),
};