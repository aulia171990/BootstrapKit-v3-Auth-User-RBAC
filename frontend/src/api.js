// Thin API client: token disimpan di localStorage, header Bearer otomatis.
const TOKEN_KEY = 'ojol_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req(path, opts = {}) {
  const headers = { Accept: 'application/json', ...(opts.headers || {}) };
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
  createOrder: (p) => req('/orders', { method: 'POST', body: JSON.stringify(p) }),
  acceptOrder: (id) => req('/orders/' + id + '/accept', { method: 'POST' }),
  updateStatus: (id, status) => req('/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateLocation: (id, p) => req('/orders/' + id + '/location', { method: 'POST', body: JSON.stringify(p) }),
  pay: (id, method) => req('/orders/' + id + '/pay', { method: 'POST', body: JSON.stringify({ method }) }),
};
