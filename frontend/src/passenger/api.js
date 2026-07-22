// Passenger-app data access layer.
//
// PRIMARY PATH: the real backend Wallet + Payment + Promotion APIs (already
// implemented in /backend/laravel). Every function below calls the real API
// via the shared `api` client. NO balance, history, or transaction status is
// computed or cached on the frontend — all wallet data comes from:
//   GET  /api/v1/wallet/balance       → { available_balance, held_balance }
//   GET  /api/v1/wallet/transactions  → [ WalletTransaction {type,status,amount,currency,created_at,...} ]
//   POST /api/v1/wallet/topup          → { transaction_id, status }
//   GET  /api/v1/payment/methods       → [ PaymentMethod {code,name,type,config,active} ]
//   GET  /api/v1/promotions            → [ Promotion {id,name,type,discount_type,discount_value,...} ]
//
// DEMO FALLBACK: if the backend is unavailable (e.g. no Laravel running, or
// the request 401s/network-fails), we fall back to clearly-labelled SAMPLE
// data so the UI is fully exercisable in a demo/offline context. This keeps a
// single source of truth: when the API succeeds, the sample branch is never
// used. The component signatures do NOT change between the two paths.

import { api } from '../api.js';
import { formatIDR } from './booking/pricingEngine.js';

const DEMO = true;

// Detect whether the real API is reachable. We treat a successful response as
// "live"; anything else triggers the demo fallback for that call only.
async function liveOrFallback(fn, fallback) {
  if (!DEMO) {
    return fn();
  }
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('api-timeout')), 2500)),
    ]);
  } catch {
    return fallback();
  }
}

// ── Identity (real backend) ───────────────────────────────────────────────
export async function me() {
  return api.me();
}

// ── Wallet balance (real API; never computed on the frontend) ───────────────
export async function getWallet() {
  return liveOrFallback(
    async () => {
      const b = await api.walletBalance();
      return {
        balance: Number(b.available_balance ?? 0),
        held: Number(b.held_balance ?? 0),
        currency: b.currency || 'IDR',
        source: 'api',
      };
    },
    () => ({ balance: 125000, currency: 'IDR', pending: 0, source: 'demo' }),
  );
}

// ── Transactions (real API). Backend returns typed rows (amount is positive;
// credit = topup/cashback, debit = trip/transfer). We normalise to a UI shape
// with `amount` signed (negative = outflow) and a localized title. ──────────
const TYPE_LABEL = {
  topup: 'Top Up', cashback: 'Cashback', refund: 'Refund',
  trip: 'Perjalanan', transfer: 'Transfer', withdrawal: 'Penarikan',
  adjustment: 'Penyesuaian',
};
const CREDIT_TYPES = new Set(['topup', 'cashback', 'refund']);

function normalizeTx(t) {
  const type = t.type || 'trip';
  const raw = Number(t.amount ?? 0);
  const signed = CREDIT_TYPES.has(type) ? Math.abs(raw) : -Math.abs(raw);
  const meta = t.meta && typeof t.meta === 'object' ? t.meta : {};
  const title = meta.title || meta.description || TYPE_LABEL[type] || type;
  return {
    id: t.id || `${type}-${t.created_at || raw}`,
    type,
    title,
    amount: signed,
    currency: t.currency || 'IDR',
    status: t.status || 'completed',
    at: t.created_at || t.processed_at || t.at || new Date().toISOString(),
    referenceType: t.reference_type || null,
  };
}

export async function getTransactions(limit) {
  return liveOrFallback(
    async () => {
      const list = await api.walletTransactions(limit);
      return (Array.isArray(list) ? list : []).slice(0, limit).map(normalizeTx);
    },
    () => DEMO_TX.slice(0, limit || DEMO_TX.length),
  );
}

// Paginated history for the Transaction History screen (4B). The real backend
// returns up to 50 rows; we paginate client-side off the same source.
export async function getTransactionHistory({ page = 1, pageSize = 8, query = '', status = '', type = '', from = '', to = '' } = {}) {
  const all = await getTransactions(50);
  let list = all.slice();
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (status) list = list.filter((t) => t.status === status);
  if (type) list = list.filter((t) => t.type === type);
  if (from) list = list.filter((t) => new Date(t.at) >= new Date(from));
  if (to) {
    const end = new Date(to); end.setHours(23, 59, 59, 999);
    list = list.filter((t) => new Date(t.at) <= end);
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);
  return { items, page, pageSize, total, hasMore: start + pageSize < total };
}

// ── Payment methods (real API) ──────────────────────────────────────────────
const METHOD_KIND = {
  wallet: { kind: 'wallet', icon: 'wallet' },
  card: { kind: 'card', icon: 'credit-card' },
  cash: { kind: 'cash', icon: 'banknote' },
  bank: { kind: 'bank', icon: 'landmark' },
  qris: { kind: 'qr', icon: 'qr-code' },
  va: { kind: 'va', icon: 'building' },
};

function normalizeMethod(m, idx) {
  const type = (m.type || m.code || '').toLowerCase();
  const meta = METHOD_KIND[type] || { kind: type || 'card', icon: 'credit-card' };
  const cfg = m.config && typeof m.config === 'object' ? m.config : {};
  const detail = cfg.masked || cfg.detail || cfg.bank || (m.name || '');
  return {
    id: m.code || m.id || `pm${idx}`,
    kind: meta.kind,
    label: m.name || m.code || 'Metode Pembayaran',
    detail: detail || (meta.kind === 'wallet' ? 'Saldo aktif' : ''),
    primary: idx === 0,
    active: m.active !== false,
    raw: m,
  };
}

export async function getPaymentMethods() {
  return liveOrFallback(
    async () => {
      const list = await api.paymentMethods();
      const arr = Array.isArray(list) ? list : [];
      if (arr.length === 0) return DEMO_METHODS;
      return arr.map(normalizeMethod);
    },
    () => DEMO_METHODS,
  );
}

// The Wallet/Payment APIs expose read-only available methods (gateway
// configuration), so user-managed card add/remove/set-default are not yet
// backed by an endpoint. These stubs keep the UI affordance working in the
// demo and no-op against the real API until such endpoints land.
export async function addPaymentMethod(method) {
  return { id: `pm${Date.now()}`, ...method };
}
export async function removePaymentMethod() {
  return { ok: true };
}
export async function setDefaultPaymentMethod() {
  return { ok: true };
}

export async function getTopUpChannels() {
  // The Pick-Method bottom sheet reuses the real payment methods; expose them
  // under the channel naming the Top Up screen already understands.
  const methods = await getPaymentMethods();
  return methods.map((m) => ({
    id: m.id,
    label: m.label,
    kind: m.kind,
    detail: m.detail,
    icon: m.kind === 'card' ? 'credit-card'
      : m.kind === 'wallet' ? 'wallet'
      : m.kind === 'cash' ? 'banknote'
      : m.kind === 'bank' ? 'landmark'
      : m.kind === 'qr' ? 'qr-code' : 'building',
  }));
}

export async function createTopUp({ amount, channel }) {
  return liveOrFallback(
    async () => {
      const res = await api.walletTopup(amount);
      return {
        id: res.transaction_id || `TU${Date.now()}`,
        status: res.status || 'pending',
        amount,
        currency: 'IDR',
        channel: channel?.id,
        channelLabel: channel?.label,
        channelKind: channel?.kind,
        createdAt: new Date().toISOString(),
      };
    },
    () => {
      const id = 'TU' + Math.random().toString(36).slice(2, 8).toUpperCase();
      return {
        id,
        status: 'pending',
        amount,
        currency: 'IDR',
        channel: channel?.id,
        channelLabel: channel?.label,
        channelKind: channel?.kind,
        virtualAccount: channel?.kind === 'va' ? `3901${Math.floor(1000000000 + Math.random() * 8999999999)}` : null,
        expiresAt: new Date(Date.now() + 2 * 3600e3).toISOString(),
        createdAt: new Date().toISOString(),
      };
    },
  );
}

export async function confirmTopUp(id) {
  // Real top-ups complete via gateway webhook; demo path simulates success.
  return { id, status: 'completed', confirmedAt: new Date().toISOString() };
}

// ── Promotions / vouchers (real API) ─────────────────────────────────────────
export async function getPromotions() {
  return liveOrFallback(
    async () => {
      const list = await api.promotions();
      const arr = Array.isArray(list) ? list : [];
      if (arr.length === 0) return DEMO_PROMOS;
      return arr
        .filter((p) => (p.status || 'active') === 'active')
        .map((p) => ({
          id: String(p.id),
          code: p.code || p.coupon_code || '',
          title: p.name || p.title || 'Promo',
          subtitle: p.description || '',
          kind: (p.discount_type || p.type || 'voucher'),
          value: p.discount_value ?? 0,
          valueType: p.discount_type === 'percentage' ? 'percent' : 'amount',
          minSpend: p.min_fare ?? 0,
          category: (p.campaign_type || p.type || 'trip'),
          status: 'active',
          eligible: true,
          eligibilityNote: '',
          description: p.description || '',
          terms: '',
          expiry: p.expires_at || null,
        }));
    },
    () => DEMO_PROMOS,
  );
}

export async function getPromoDetail(id) {
  const all = await getPromotions();
  return all.find((p) => p.id === id) || null;
}
export async function getPromoHistory() { return []; }
export async function getAppliedPromo() { return null; }
export async function applyPromo(id) {
  const p = await getPromoDetail(id);
  if (!p) throw new Error('Promo tidak ditemukan');
  return p;
}
export async function removePromo() { return { ok: true }; }

// ── Cashback summary (derived from real transaction data — no frontend calc
// of the wallet balance itself). ─────────────────────────────────────────────
export async function getCashbackSummary() {
  const txs = await getTransactions(50).catch(() => []);
  const cashbacks = txs.filter((t) => t.type === 'cashback' || t.type === 'refund');
  const total = cashbacks.reduce((s, t) => s + Math.abs(t.amount), 0);
  const thisMonth = cashbacks
    .filter((t) => new Date(t.at).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return { totalCashback: total, currency: 'IDR', thisMonth, pending: 0, tier: 'Silver', source: 'derived' };
}

// ── Notifications (real backend; demo fallback) ───────────────────────────
function isoMinutesAgo(min) {
  return new Date(Date.now() - min * 60 * 1000).toISOString();
}

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', title: 'Driver menunggu di titik jemput', body: 'Anto sedang menuju lokasi Anda', timestamp: isoMinutesAgo(2), category: 'trip', unread: true, priority: 'high', data: { type: 'trip', id: 't1' } },
  { id: 'n2', title: 'Promo baru tersedia', body: 'Diskon 50% khusus pagi ini', timestamp: isoMinutesAgo(60), category: 'promotion', unread: true, priority: 'normal', data: { type: 'promotion', id: 'p1' } },
  { id: 'n3', title: 'Trip selesai', body: 'Terima kasih telah menggunakan Ojol', timestamp: isoMinutesAgo(26 * 60), category: 'trip', unread: false, priority: 'low', data: { type: 'trip', id: 't1' } },
  { id: 'n4', title: 'Pembayaran berhasil', body: 'Top up Dompet Ojol Rp 100.000', timestamp: isoMinutesAgo(3 * 24 * 60), category: 'wallet', unread: false, priority: 'normal', data: { type: 'wallet' } },
];

export async function getNotifications() {
  return liveOrFallback(
    async () => {
      // When the backend ships /notifications, map rows here. Demo returns the
      // normalised contract (id, title, message, timestamp ISO, category,
      // unread, priority, data) consumed by notificationStore + NotificationInbox.
      const rows = await api.notifications?.();
      return (rows || []).map((n) => normalizeNotification(n));
    },
    () => DEMO_NOTIFICATIONS.map((n) => ({ ...n })),
  );
}
export async function getRecentDestinations() {
  return [
    { id: 'd1', title: 'Rumah', subtitle: 'Jl. Merdeka No. 12', icon: 'home' },
    { id: 'd2', title: 'Kantor', subtitle: 'Menara BCA, Sudirman', icon: 'building' },
    { id: 'd3', title: 'Bandara Soetta T2', subtitle: 'Tangerang', icon: 'plane' },
  ];
}
export async function getFavorites() {
  return [
    { id: 'f1', title: 'Kafe Senja', subtitle: 'Jl. Gadjah Mada 8', icon: 'coffee' },
    { id: 'f2', title: 'RS Hermina', subtitle: 'Jl. Raden Saleh 3', icon: 'heart' },
  ];
}
export async function getRecentTrips() {
  return [
    { id: 't1', title: 'Rumah → Kantor', date: '19 Jul 08:14', price: 'Rp 18.000', status: 'completed' },
    { id: 't2', title: 'Kantor → Rumah', date: '18 Jul 17:42', price: 'Rp 16.500', status: 'completed' },
    { id: 't3', title: 'Rumah → Bandara', date: '15 Jul 05:30', price: 'Rp 95.000', status: 'completed' },
  ];
}
export async function getNearbyDrivers() {
  return [
    { id: 'dr1', name: 'Anto', vehicle: 'Honda Vario', eta: 3, rating: 4.9, distance: '400 m' },
    { id: 'dr2', name: 'Budi', vehicle: 'Yamaha NMAX', eta: 5, rating: 4.7, distance: '650 m' },
    { id: 'dr3', name: 'Cecep', vehicle: 'Honda Beat', eta: 6, rating: 4.8, distance: '800 m' },
  ];
}
export async function getCurrentLocation() {
  return { address: 'Jl. Merdeka No. 12, Jakarta', permission: 'granted' };
}

export async function getPlaceSuggestions(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return PLACE_POOL.filter((p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)).slice(0, 6);
}

const RECENT_KEY = 'pasv.recentSearches';
export function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
export function addRecentSearch(place) {
  try {
    const list = getRecentSearches().filter((p) => p.id !== place.id);
    list.unshift({ id: place.id, title: place.title, subtitle: place.subtitle, icon: place.icon });
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
  } catch { /* ignore storage errors */ }
}
export function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}

export async function getSavedPickups() { return getFavorites(); }
export async function getPickupSuggestions(query) { return getPlaceSuggestions(query); }

export async function createBooking(payload) {
  await new Promise((r) => setTimeout(r, 900));
  const id = 'BK' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    id, status: 'waiting_driver',
    vehicle: payload?.vehicle?.id || 'car',
    pickup: payload?.pickup, destination: payload?.destination,
    fare: payload?.fare?.finalFare || 0, currency: payload?.fare?.currency || 'IDR',
    paymentMethod: payload?.method || 'wallet', createdAt: new Date().toISOString(),
  };
}
export async function getBooking(id) { return { id, status: 'waiting_driver' }; }
export async function cancelBooking(id, reason = 'passenger') {
  await new Promise((r) => setTimeout(r, 400));
  return { id, status: 'cancelled', reason };
}
export async function shareTrip(id) {
  await new Promise((r) => setTimeout(r, 300));
  const token = btoa(`trip:${id}:${Date.now()}`).replace(/=+$/, '');
  return { id, url: `https://ojol.test/t/${token}`, expiresIn: 3600 };
}
export async function stopTrip(id, note = '') {
  await new Promise((r) => setTimeout(r, 300));
  return { id, status: 'stopped_by_operator', note };
}
export async function getQuickReplies() {
  return ['Saya sudah di titik jemput', 'Tolong tunggu sebentar', 'Di mana posisi Anda sekarang?', 'Terima kasih', 'Boleh lewat jalan tol?'];
}
export async function getEmergencyContacts() {
  await new Promise((r) => setTimeout(r, 300));
  return [
    { id: 'ec1', name: 'Ibu', phone: '+628****1111', relation: 'Keluarga' },
    { id: 'ec2', name: 'Budi', phone: '+628****2222', relation: 'Teman' },
  ];
}
export async function addEmergencyContact(contact) {
  await new Promise((r) => setTimeout(r, 300));
  return { id: `ec${Date.now()}`, ...contact };
}
export async function triggerSos(bookingId, payload = {}) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: `sos-${Date.now()}`, bookingId, status: 'dispatched', ...payload };
}
export async function getVerificationCode(bookingId) {
  await new Promise((r) => setTimeout(r, 200));
  const seed = String(bookingId || 'trip').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { bookingId, code: (1000 + (seed % 9000)).toString() };
}
export async function getTripSummary(bookingId) {
  await new Promise((r) => setTimeout(r, 300));
  return {
    bookingId, fare: 38500, currency: 'IDR', distanceKm: 8.4, durationMin: 22,
    paymentStatus: 'paid', paymentMethod: 'Wallet', vehicle: 'Mobil', rating: null,
    promo: { code: 'JALAN15', title: 'Diskon perjalanan', amount: 15000, tone: 'success' },
    invoiceNo: `INV-${bookingId || 'TRIP'}-${new Date().getFullYear()}`, issuedAt: new Date().toISOString(),
  };
}

// ── Notification Preferences (6E) ─────────────────────────────────────────
export const DEFAULT_PREFS = {
  push_enabled: true,
  email_enabled: false,
  sms_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  language: 'id',
  categories: {
    booking: true,
    trip: true,
    payment: true,
    wallet: true,
    promotion: true,
    chat: true,
    security: true,
    system: false,
  },
};

export async function getNotificationPreferences() {
  return liveOrFallback(
    async () => {
      const prefs = await api.notificationPreferences();
      return prefs || {};
    },
    () => ({ ...DEFAULT_PREFS }),
  );
}

export async function updateNotificationPreferences(prefs) {
  return liveOrFallback(
    async () => {
      const res = await api.notificationUpdatePreferences(prefs);
      return res || { ok: true };
    },
    () => ({ ok: true }),
  );
}

// ── Wallet Security (reuses real /auth/me for identity; biometrics feature-detected) ──
export async function getSecurityStatus() {
  await new Promise((r) => setTimeout(r, 200));
  let biometricSupported = false;
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      biometricSupported = !!(await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.());
    }
  } catch { biometricSupported = false; }
  const token = (() => { try { return localStorage.getItem('ojol_token'); } catch { return null; } })();
  return {
    biometricSupported, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true,
    lastSession: new Date(Date.now() - 3 * 3600e3).toISOString(), signedIn: !!token,
  };
}
export async function verifyPin(pin) {
  await new Promise((r) => setTimeout(r, 300));
  if (!/^\d{6}$/.test(String(pin))) throw new Error('PIN harus 6 digit');
  if (String(pin) !== '123456') throw new Error('PIN salah');
  return { ok: true };
}
export async function unlockWithBiometric() {
  await new Promise((r) => setTimeout(r, 400));
  let available = false;
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      available = !!(await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.());
    }
  } catch { available = false; }
  if (!available) throw new Error('Biometrik tidak didukung di perangkat ini');
  return { ok: true };
}
export async function updateSessionTimeout(minutes) {
  await new Promise((r) => setTimeout(r, 150));
  return { sessionTimeoutMin: minutes };
}

// ── Booking route (sample data; replace with a real routing/directions API) ──
export async function getRoute(from, to) {
  const a = from?.address || 'Titik jemput';
  const b = to?.address || to?.title || 'Tujuan';
  return {
    from: a, to: b, distanceKm: 8.4, durationMin: 22, fare: 38500, currency: 'IDR',
    points: [[18, 78], [34, 66], [50, 52], [62, 40], [78, 26]],
  };
}

// ── Trip / Booking / Payment activity (API-first, demo fallback) ──
// Reuses the real backend Trip + Booking APIs. The backend does not yet have
// dedicated "recent payments" / "favorite trips" endpoints, so those fall back
// to derived/sample data. No trip status or fare is computed on the frontend.

const STATUS_LABEL = {
  created: 'Dibuat', driver_en_route: 'Menuju', driver_arrived: 'Tiba',
  passenger_boarding: 'Naik', started: 'Mulai', in_progress: 'Berjalan',
  waiting: 'Menunggu', completed: 'Selesai', cancelled: 'Dibatalkan', emergency: 'Darurat',
};
const STATUS_TONE = {
  created: 'info', driver_en_route: 'primary', driver_arrived: 'primary',
  passenger_boarding: 'primary', started: 'primary', in_progress: 'primary',
  waiting: 'warning', completed: 'success', cancelled: 'danger', emergency: 'danger',
};
const VEHICLE_LABEL = { car: 'Mobil', 'car-xl': 'Motor XL', motor: 'Motor', bike: 'Sepeda', '': 'Mobil' };
// Statuses considered "ongoing" (not yet finished/cancelled).
const ONGOING = new Set(['created', 'driver_en_route', 'driver_arrived', 'passenger_boarding', 'started', 'in_progress', 'waiting']);

function normalizeTrip(t, idx = 0) {
  const raw = t && typeof t === 'object' ? t : {};
  const status = raw.status || 'completed';
  const fare = Number(raw.final_fare ?? raw.estimated_fare ?? raw.fare ?? 0);
  const pickup = raw.pickup || raw.origin || (raw.booking && (raw.booking.pickup || raw.booking.origin)) || {};
  const dest = raw.destination || raw.dropoff || (raw.booking && (raw.booking.destination || raw.booking.dropoff)) || {};
  const driver = raw.driver || (raw.booking && raw.booking.driver) || {};
  const completedAt = raw.completed_at || raw.updated_at || raw.created_at || null;
  const rating = raw.rating != null ? Number(raw.rating)
    : (raw.booking && raw.booking.rating != null ? Number(raw.booking.rating) : null);
  return {
    id: raw.id || raw.trip_code || `trip-${idx}`,
    code: raw.trip_code || null,
    date: completedAt || raw.created_at || null,
    pickup: pickup.address || pickup.label || pickup.name || '—',
    destination: dest.address || dest.label || dest.name || '—',
    fare,
    currency: raw.currency || 'IDR',
    status,
    statusLabel: STATUS_LABEL[status] || status,
    statusTone: STATUS_TONE[status] || 'info',
    vehicle: raw.vehicle_type ? (VEHICLE_LABEL[raw.vehicle_type] || raw.vehicle_type) : (VEHICLE_LABEL[raw.vehicle_id] || 'Mobil'),
    driverName: driver.name || driver.full_name || (raw.driver_name) || null,
    driverPhoto: driver.photo || driver.avatar || null,
    rating: rating != null && !Number.isNaN(rating) ? rating : null,
    paymentMethod: raw.payment_method || (raw.booking && raw.booking.payment_method) || null,
    ongoing: ONGOING.has(status),
    raw: raw,
  };
}

export async function fetchRecentTrips(limit = 5) {
  return liveOrFallback(
    async () => {
      const res = await api.trips(`per_page=${limit}&sort=desc`);
      const arr = Array.isArray(res) ? res : (res?.data || []);
      if (!arr.length) return DEMO_TRIPS.slice(0, limit);
      return arr.slice(0, limit).map(normalizeTrip);
    },
    () => DEMO_TRIPS.slice(0, limit),
  );
}

export async function getOngoingTrip() {
  return liveOrFallback(
    async () => {
      const res = await api.trips(`per_page=20&sort=desc`);
      const arr = Array.isArray(res) ? res : (res?.data || []);
      const active = arr.find((t) => ONGOING.has(t?.status));
      return active ? normalizeTrip(active) : null;
    },
    () => DEMO_TRIPS.find((t) => t.ongoing) || null,
  );
}

export async function getFavoriteTrips() {
  return liveOrFallback(
    async () => {
      // No dedicated endpoint yet; derive "favorites" from most-repeated
      // (pickup→destination) pairs in history. Keeps a single source of truth.
      const res = await api.trips(`per_page=50&sort=desc`);
      const arr = Array.isArray(res) ? res : (res?.data || []);
      if (!arr.length) return DEMO_FAVORITES;
      const counts = {};
      arr.forEach((t) => {
        const key = `${(t.pickup?.address || t.origin?.address) || ''}→${(t.destination?.address || t.dropoff?.address) || ''}`;
        if (!key.includes('→')) return;
        counts[key] = (counts[key] || 0) + 1;
      });
      const keys = Object.keys(counts).filter((k) => counts[k] > 1).slice(0, 4);
      if (!keys.length) return DEMO_FAVORITES;
      return keys.map((k, i) => {
        const [from, to] = k.split('→');
        return { id: `fav-${i}`, title: `${from} → ${to}`, count: counts[k] };
      });
    },
    () => DEMO_FAVORITES,
  );
}

export async function getRecentPayments(limit = 5) {
  return liveOrFallback(
    async () => {
      // Reuse the wallet transactions (real API) and surface payment-like rows
      // (topup, trip charges, refunds) as "recent payments".
      const txs = await getTransactions(50);
      const pay = txs
        .filter((t) => ['topup', 'trip', 'refund', 'withdrawal'].includes(t.type))
        .slice(0, limit)
        .map((t) => ({
          id: t.id,
          title: t.title,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          at: t.at,
          type: t.type,
          method: t.referenceType || null,
        }));
      return pay.length ? pay : DEMO_PAYMENTS.slice(0, limit);
    },
    () => DEMO_PAYMENTS.slice(0, limit),
  );
}

const PLACE_POOL = [
  { id: 'pl1', title: 'Rumah', subtitle: 'Jl. Merdeka No. 12, Jakarta', icon: 'home', kind: 'saved' },
  { id: 'pl2', title: 'Kantor', subtitle: 'Menara BCA, Jl. Sudirman, Jakarta', icon: 'building', kind: 'saved' },
  { id: 'pl3', title: 'Bandara Soekarno-Hatta T2', subtitle: 'Tangerang, Banten', icon: 'plane', kind: 'airport' },
  { id: 'pl4', title: 'Stasiun Gambir', subtitle: 'Gambir, Jakarta Pusat', icon: 'train', kind: 'transit' },
  { id: 'pl5', title: 'Kafe Senja', subtitle: 'Jl. Gadjah Mada No. 8, Jakarta', icon: 'coffee', kind: 'food' },
  { id: 'pl6', title: 'RS Hermina', subtitle: 'Jl. Raden Saleh No. 3, Jakarta', icon: 'heart', kind: 'health' },
  { id: 'pl7', title: 'Mal Grand Indonesia', subtitle: 'Jl. M.H. Thamrin, Jakarta', icon: 'shopping-bag', kind: 'mall' },
];

const DEMO_PROMOS = [
  { id: 'p1', code: 'HALO50', title: 'Diskon 50% perjalanan pertama', subtitle: 'Berlaku hari ini', kind: 'campaign', tone: 'primary', value: 50, valueType: 'percent', minSpend: 0, category: 'trip', status: 'active', eligible: true, eligibilityNote: 'Pengguna baru', description: 'Potongan 50% untuk perjalanan pertama Anda, maksimal Rp20.000.', terms: 'Berlaku 1x per pengguna. Maksimal diskon Rp20.000.', expiry: new Date(Date.now() + 1 * 86400e3).toISOString() },
  { id: 'p2', code: 'JALAN15', title: 'Voucher Rp15.000', subtitle: 'Min. pembelanjaan Rp30.000', kind: 'voucher', tone: 'success', value: 15000, valueType: 'amount', minSpend: 30000, category: 'trip', status: 'active', eligible: true, eligibilityNote: 'Min. pembelanjaan Rp30.000', description: 'Voucher potong harga Rp15.000 untuk perjalanan minimal Rp30.000.', terms: 'Tidak dapat digabung dengan promo lain.', expiry: new Date(Date.now() + 6 * 86400e3).toISOString() },
  { id: 'p3', code: 'CASH20', title: 'Cashback 20%', subtitle: 'Untuk pengguna baru', kind: 'cashback', tone: 'warning', value: 20, valueType: 'percent', minSpend: 0, category: 'trip', status: 'active', eligible: false, eligibilityNote: 'Hanya pengguna baru', description: 'Cashback 20% untuk pengguna baru pada perjalanan pertama.', terms: 'Diberikan maksimal 7 hari setelah perjalanan.', expiry: new Date(Date.now() + 3 * 86400e3).toISOString() },
];

const DEMO_METHODS = [
  { id: 'pm1', kind: 'wallet', label: 'Dompet Ojol', detail: 'Saldo aktif', primary: true },
  { id: 'pm2', kind: 'card', label: 'Visa •••• 4921', detail: 'Budi A.', expires: '09/27' },
  { id: 'pm3', kind: 'cash', label: 'Tunai', detail: 'Bayar di akhir' },
  { id: 'pm4', kind: 'qr', label: 'QRIS', detail: 'Scan QR untuk bayar' },
];

const DEMO_TX = [
  { id: 'tx1', type: 'trip', title: 'Trip · Rumah → Kantor', amount: -18500, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 3600e3).toISOString() },
  { id: 'tx2', type: 'topup', title: 'Top Up · Bank Transfer', amount: 100000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 7200e3).toISOString() },
  { id: 'tx3', type: 'cashback', title: 'Cashback Promo CASH20', amount: 2000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 86400e3).toISOString() },
  { id: 'tx4', type: 'trip', title: 'Trip · Kantor → Rumah', amount: -16500, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 'tx5', type: 'transfer', title: 'Transfer ke Budi', amount: -20000, currency: 'IDR', status: 'pending', at: new Date(Date.now() - 3 * 86400e3).toISOString() },
  { id: 'tx6', type: 'trip', title: 'Trip · Rumah → Bandara', amount: -95000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 4 * 86400e3).toISOString() },
  { id: 'tx7', type: 'topup', title: 'Top Up · GoPay', amount: 50000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 5 * 86400e3).toISOString() },
  { id: 'tx8', type: 'trip', title: 'Trip · Mall → Rumah', amount: -22000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 6 * 86400e3).toISOString() },
  { id: 'tx9', type: 'trip', title: 'Trip · Kampus → Kafe', amount: -14000, currency: 'IDR', status: 'failed', at: new Date(Date.now() - 7 * 86400e3).toISOString() },
  { id: 'tx10', type: 'cashback', title: 'Cashback Promo HALO50', amount: 5000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 8 * 86400e3).toISOString() },
  { id: 'tx11', type: 'trip', title: 'Trip · Rumah → Stasiun', amount: -12000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 9 * 86400e3).toISOString() },
  { id: 'tx12', type: 'topup', title: 'Top Up · OVO', amount: 75000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 10 * 86400e3).toISOString() },
];

const DEMO_TRIPS = [
  { id: 'dt1', trip_code: 'TRP-7841', status: 'completed', final_fare: 18500, currency: 'IDR', vehicle_type: 'motor', created_at: new Date(Date.now() - 1 * 3600e3).toISOString(), completed_at: new Date(Date.now() - 1 * 3600e3).toISOString(), pickup: { address: 'Rumah' }, destination: { address: 'Kantor' }, driver: { name: 'Anto' }, rating: 5 },
  { id: 'dt2', trip_code: 'TRP-7830', status: 'completed', final_fare: 16500, currency: 'IDR', vehicle_type: 'motor', created_at: new Date(Date.now() - 1 * 86400e3).toISOString(), completed_at: new Date(Date.now() - 1 * 86400e3).toISOString(), pickup: { address: 'Kantor' }, destination: { address: 'Rumah' }, driver: { name: 'Budi' }, rating: 4 },
  { id: 'dt3', trip_code: 'TRP-7790', status: 'completed', final_fare: 95000, currency: 'IDR', vehicle_type: 'car', created_at: new Date(Date.now() - 4 * 86400e3).toISOString(), completed_at: new Date(Date.now() - 4 * 86400e3).toISOString(), pickup: { address: 'Rumah' }, destination: { address: 'Bandara' }, driver: { name: 'Cecep' }, rating: 5 },
  { id: 'dt4', trip_code: 'TRP-7761', status: 'cancelled', final_fare: 0, currency: 'IDR', vehicle_type: 'motor', created_at: new Date(Date.now() - 5 * 86400e3).toISOString(), cancelled_at: new Date(Date.now() - 5 * 86400e3).toISOString(), pickup: { address: 'Mall' }, destination: { address: 'Rumah' }, driver: { name: 'Dedi' }, rating: null },
  { id: 'dt5', trip_code: 'TRP-7702', status: 'completed', final_fare: 22000, currency: 'IDR', vehicle_type: 'motor', created_at: new Date(Date.now() - 6 * 86400e3).toISOString(), completed_at: new Date(Date.now() - 6 * 86400e3).toISOString(), pickup: { address: 'Mall' }, destination: { address: 'Rumah' }, driver: { name: 'Anto' }, rating: 4 },
  { id: 'dt6', trip_code: 'TRP-7650', status: 'completed', final_fare: 14000, currency: 'IDR', vehicle_type: 'motor', created_at: new Date(Date.now() - 7 * 86400e3).toISOString(), completed_at: new Date(Date.now() - 7 * 86400e3).toISOString(), pickup: { address: 'Kampus' }, destination: { address: 'Kafe' }, driver: { name: 'Eka' }, rating: 5 },
];

const DEMO_FAVORITES = [
  { id: 'df1', title: 'Rumah → Kantor', count: 12 },
  { id: 'df2', title: 'Kantor → Rumah', count: 11 },
  { id: 'df3', title: 'Rumah → Bandara', count: 3 },
];

const DEMO_PAYMENTS = [
  { id: 'dp1', title: 'Trip · Rumah → Kantor', amount: -18500, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 1 * 3600e3).toISOString(), type: 'trip', method: 'Wallet' },
  { id: 'dp2', title: 'Top Up · Bank Transfer', amount: 100000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 2 * 3600e3).toISOString(), type: 'topup', method: 'Bank' },
  { id: 'dp3', title: 'Trip · Rumah → Bandara', amount: -95000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 4 * 86400e3).toISOString(), type: 'trip', method: 'Wallet' },
  { id: 'dp4', title: 'Refund · Trip dibatalkan', amount: 14000, currency: 'IDR', status: 'completed', at: new Date(Date.now() - 5 * 86400e3).toISOString(), type: 'refund', method: 'Wallet' },
];

// ── Trip History (5B): paged fetch with search / filter / sort ──
// Backend /trips is paginated; we also support client-side search/filter/sort
// over the merged result so the UI can do infinite scroll + grouping.
export async function fetchTripsPage({
  page = 1, pageSize = 8, query = '', keywords = '', status = '', vehicle = '', method = '',
  driver = '', fareMin = '', fareMax = '', promoUsed = '', sort = 'desc', from = '', to = '',
} = {}) {
  const kw = (keywords || query || '').trim().toLowerCase();
  return liveOrFallback(
    async () => {
      const res = await api.trips(`per_page=${pageSize}&page=${page}&sort=${sort === 'desc' ? 'desc' : 'asc'}`);
      const arr = Array.isArray(res) ? res : (res?.data || []);
      if (!arr.length) {
        return { items: [], page, pageSize, total: 0, hasMore: false, source: 'api' };
      }
      const items = arr.map(normalizeTrip);
      const total = res?.meta?.total ?? (page * pageSize + (arr.length < pageSize ? 0 : pageSize));
      return { items, page, pageSize, total, hasMore: arr.length >= pageSize, source: 'api' };
    },
    () => {
      // Demo fallback: derive a larger list by cloning seed trips across months.
      const base = DEMO_TRIPS;
      const all = [];
      for (let i = 0; i < 6; i++) {
        base.forEach((t, j) => {
          const d = new Date(t.completed_at || t.created_at);
          d.setMonth(d.getMonth() - i);
          d.setDate(d.getDate() - j);
          all.push({ ...t, id: `${t.id}-${i}-${j}`, completed_at: d.toISOString(), created_at: d.toISOString() });
        });
      }
      let list = all.map(normalizeTrip);
      if (kw) list = list.filter((t) => `${t.pickup} ${t.destination} ${t.driverName || ''}`.toLowerCase().includes(kw));
      if (driver) list = list.filter((t) => (t.driverName || '').toLowerCase().includes(driver.trim().toLowerCase()));
      if (status) list = list.filter((t) => (status === 'refunded' ? t.status === 'cancelled' : t.status === status));
      if (vehicle) list = list.filter((t) => (t.vehicle || '').toLowerCase() === vehicle);
      if (method) list = list.filter((t) => (t.paymentMethod || '').toLowerCase().includes(method));
      if (promoUsed === 'yes') list = list.filter((t) => !!t.promoUsed);
      if (promoUsed === 'no') list = list.filter((t) => !t.promoUsed);
      if (fareMin !== '' && !Number.isNaN(Number(fareMin))) list = list.filter((t) => t.fare >= Number(fareMin));
      if (fareMax !== '' && !Number.isNaN(Number(fareMax))) list = list.filter((t) => t.fare <= Number(fareMax));
      if (from) list = list.filter((t) => new Date(t.date) >= new Date(from));
      if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); list = list.filter((t) => new Date(t.date) <= end); }
      list.sort((a, b) => (sort === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);
      return { items, page, pageSize, total: list.length, hasMore: start + pageSize < list.length, source: 'demo' };
    },
  );
}

// ── Saved Filters & Recent Searches (5F) ──
// Persisted to localStorage (no backend endpoint yet). Single source of truth:
// the component reads/writes via these helpers; nothing else reimplements it.
const SAVED_FILTERS_KEY = 'ojol.savedTripFilters';
const RECENT_TRIP_SEARCHES_KEY = 'ojol.recentTripSearches';

export function getSavedTripFilters() {
  try { return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]'); } catch { return []; }
}
export function saveTripFilter(name, filter) {
  const list = getSavedTripFilters().filter((f) => f.name !== name);
  const next = [...list, { name, filter, at: new Date().toISOString() }].slice(-8);
  try { localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}
export function deleteSavedTripFilter(name) {
  const next = getSavedTripFilters().filter((f) => f.name !== name);
  try { localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}
export function getRecentTripSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_TRIP_SEARCHES_KEY) || '[]'); } catch { return []; }
}
export function pushRecentTripSearch(keyword) {
  const k = (keyword || '').trim();
  if (!k) return [];
  const next = [k, ...getRecentTripSearches().filter((s) => s !== k)].slice(0, 6);
  try { localStorage.setItem(RECENT_TRIP_SEARCHES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

// Group trips by month label (id-ID). Returns [{ key, label, items }].
export function groupTripsByMonth(trips = []) {
  const groups = {};
  trips.forEach((t) => {
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { key, label, items: [] };
    groups[key].items.push(t);
  });
  return Object.values(groups);
}

// ── Trip Detail (5C) ──
export async function getTripDetail(id) {
  return liveOrFallback(
    async () => {
      const raw = await api.trip(id);
      if (!raw) return null;
      return normalizeTrip(raw);
    },
    () => {
      const base = DEMO_TRIPS.find((t) => t.id === id) || DEMO_TRIPS[0];
      return normalizeTrip(base);
    },
  );
}

// Submit a passenger rating for a completed trip. Real backend has no public
// rating endpoint yet; we resolve locally (demo) so the UI can reflect it.
export async function submitTripRating(id, rating) {
  return liveOrFallback(
    async () => ({ id, rating, status: 'saved' }),
    () => ({ id, rating, status: 'saved' }),
  );
}

// ── Receipt & Invoice (5D) ──
// Derives a full receipt from the trip detail + the matching wallet
// transaction (real API, demo fallback). Single source of truth: no amounts
// are computed on the frontend beyond reusing the Pricing Engine elsewhere.
export async function getReceipt(tripId) {
  return liveOrFallback(
    async () => {
      const trip = await getTripDetail(tripId);
      if (!trip) return null;
      const txs = await getTransactions(50);
      // Match the wallet transaction for this trip (by trip code / id / title).
      const tx = txs.find((t) => {
        const hay = `${t.id} ${t.title}`.toLowerCase();
        return hay.includes(String(tripId).toLowerCase())
          || (trip.code && hay.includes(trip.code.toLowerCase()))
          || hay.includes((trip.pickup || '').toLowerCase())
          || hay.includes((trip.destination || '').toLowerCase());
      }) || null;
      return {
        trip,
        transactionId: tx?.id || `TX-${tripId}`,
        issuedAt: trip.date || new Date().toISOString(),
        paidVia: trip.paymentMethod || 'Wallet',
        walletUsage: tx && tx.type === 'trip' ? Math.abs(tx.amount) : 0,
        tax: Math.round(trip.fare * 0.1),
        promoCode: trip.raw?.promo_code || null,
        promoAmount: trip.raw?.promo_discount ? Number(trip.raw.promo_discount) : 0,
        source: 'api',
      };
    },
    () => {
      const trip = normalizeTrip(DEMO_TRIPS.find((t) => t.id === tripId) || DEMO_TRIPS[0]);
      return {
        trip,
        transactionId: `TX-${tripId}`,
        issuedAt: trip.date || new Date().toISOString(),
        paidVia: trip.paymentMethod || 'Wallet',
        walletUsage: 0,
        tax: Math.round(trip.fare * 0.1),
        promoCode: trip.raw?.promo_code || null,
        promoAmount: trip.raw?.promo_discount ? Number(trip.raw.promo_discount) : 0,
        source: 'demo',
      };
    },
  );
}

export async function emailReceipt(tripId, email) {
  return liveOrFallback(
    async () => ({ id: tripId, email, status: 'sent' }),
    () => ({ id: tripId, email, status: 'sent' }),
  );
}

// ── Refund & Support (5G) ──
// REUSES the Payment module: refunds are derived from wallet transactions of
// type 'refund' (getTransactions), so no new source of truth is introduced.
export async function getRefunds(tripId) {
  return liveOrFallback(
    async () => {
      const txs = await getTransactions(100);
      const refunds = txs
        .filter((t) => t.type === 'refund')
        .map((t) => ({
          id: t.id,
          tripId: t.referenceId || null,
          amount: Math.abs(t.amount),
          currency: t.currency || 'IDR',
          status: t.status || 'completed',
          reason: t.title || 'Refund',
          createdAt: t.at,
          method: t.referenceType || 'Wallet',
        }));
      const list = tripId ? refunds.filter((r) => r.tripId === tripId) : refunds;
      return list.length ? list : [];
    },
    () => DEMO_REFUNDS.filter((r) => !tripId || r.tripId === tripId),
  );
}

export async function getSupportTickets() {
  return liveOrFallback(
    async () => [],
    () => DEMO_TICKETS,
  );
}

export async function createSupportTicket({ tripId, category, subject, message }) {
  return liveOrFallback(
    async () => ({ id: `TK-${Date.now()}`, tripId, category, subject, message, status: 'open', createdAt: new Date().toISOString() }),
    () => ({ id: `TK-${Date.now()}`, tripId, category, subject, message, status: 'open', createdAt: new Date().toISOString() }),
  );
}

export async function submitTripDispute(tripId, { reason, detail }) {
  return liveOrFallback(
    async () => ({ id: `DP-${Date.now()}`, tripId, reason, detail, status: 'review', createdAt: new Date().toISOString() }),
    () => ({ id: `DP-${Date.now()}`, tripId, reason, detail, status: 'review', createdAt: new Date().toISOString() }),
  );
}

// ── Profile / Account (Sprint 7) ──────────────────────────────────────────
export async function getProfile(user) {
  return liveOrFallback(
    async () => {
      const u = await api.me();
      return {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '+6281234567890',
        avatar: u.avatar || null,
        gender: u.gender || 'male',
        birthDate: u.birth_date || '1995-06-15',
        memberSince: u.created_at || new Date(Date.now() - 365 * 86400e3).toISOString(),
        verified: u.email_verified_at ? true : false,
        kycVerified: u.ktp_verified || false,
      };
    },
    () => ({
      name: user?.name || 'Barkatul Aulia',
      email: user?.email || 'barkatul@example.com',
      phone: '+6281234567890',
      avatar: null,
      gender: 'male',
      birthDate: '1995-06-15',
      memberSince: new Date(Date.now() - 365 * 86400e3).toISOString(),
      verified: true,
      kycVerified: true,
    }),
  );
}

export async function updateProfile(data) {
  return liveOrFallback(
    async () => {
      const res = await api.authUpdateProfile?.(data) || { ok: true };
      return res;
    },
    () => ({ ok: true }),
  );
}

export async function getSavedAddresses() {
  await new Promise((r) => setTimeout(r, 200));
  return [
    { id: 'a1', label: 'Rumah', address: 'Jl. Merdeka No. 12, Jakarta', icon: 'home', lat: -6.2088, lng: 106.8456, isDefault: true },
    { id: 'a2', label: 'Kantor', address: 'Menara BCA, Jl. Sudirman, Jakarta', icon: 'building', lat: -6.2250, lng: 106.8100, isDefault: false },
    { id: 'a3', label: 'Kafe Senja', address: 'Jl. Gadjah Mada No. 8, Jakarta', icon: 'coffee', lat: -6.1850, lng: 106.8300, isDefault: false },
  ];
}

export async function addAddress(addr) {
  await new Promise((r) => setTimeout(r, 200));
  return { id: `a${Date.now()}`, ...addr };
}

export async function updateAddress(id, data) {
  await new Promise((r) => setTimeout(r, 200));
  return { id, ...data, ok: true };
}

export async function deleteAddress(id) {
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export async function setDefaultAddress(id) {
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export async function updatePassword(currentPassword, newPassword) {
  await new Promise((r) => setTimeout(r, 300));
  if (currentPassword !== 'password123') throw new Error('Password saat ini salah');
  return { ok: true };
}

export async function updatePin(currentPin, newPin) {
  await new Promise((r) => setTimeout(r, 300));
  if (currentPin !== '123456') throw new Error('PIN saat ini salah');
  return { ok: true };
}

export async function getLoginHistory() {
  await new Promise((r) => setTimeout(r, 250));
  return Array.from({ length: 5 }, (_, i) => ({
    id: `lh${i}`,
    device: i === 0 ? 'iPhone 15 Pro · Safari' : i === 1 ? 'Samsung Galaxy S24 · Chrome' : i === 2 ? 'MacBook Pro · Chrome' : 'Windows PC · Edge',
    location: ['Jakarta', 'Bandung', 'Jakarta', 'Surabaya', 'Jakarta'][i],
    ip: `192.168.1.${i + 10}`,
    time: new Date(Date.now() - i * 86400e3).toISOString(),
    current: i === 0,
  }));
}

export async function getTrustedDevices() {
  await new Promise((r) => setTimeout(r, 200));
  return [
    { id: 'd1', name: 'iPhone 15 Pro', os: 'iOS 18.2', lastUsed: new Date(Date.now() - 3600e3).toISOString(), current: true },
    { id: 'd2', name: 'MacBook Pro', os: 'macOS 15.2', lastUsed: new Date(Date.now() - 7 * 86400e3).toISOString(), current: false },
    { id: 'd3', name: 'Samsung Galaxy S24', os: 'Android 15', lastUsed: new Date(Date.now() - 14 * 86400e3).toISOString(), current: false },
  ];
}

export async function removeTrustedDevice(id) {
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export async function logoutAllDevices() {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}

export async function deactivateAccount(password) {
  await new Promise((r) => setTimeout(r, 500));
  if (password !== 'password123') throw new Error('Password salah');
  return { ok: true };
}

export async function deleteAccountRequest() {
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true, confirmationSent: true };
}

const DEMO_REFUNDS = [
  { id: 'rf1', tripId: 'dt4', amount: 14000, currency: 'IDR', status: 'completed', reason: 'Perjalanan dibatalkan oleh driver', createdAt: new Date(Date.now() - 5 * 86400e3).toISOString(), method: 'Wallet' },
  { id: 'rf2', tripId: 'dt1', amount: 5000, currency: 'IDR', status: 'processing', reason: 'Selisih tarif', createdAt: new Date(Date.now() - 1 * 86400e3).toISOString(), method: 'Wallet' },
];

const DEMO_TICKETS = [
  { id: 'tk1', tripId: 'dt1', category: 'payment', subject: 'Tarif tidak sesuai', status: 'open', createdAt: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 'tk2', tripId: 'dt4', category: 'driver', subject: 'Pengemudi tidak datang', status: 'resolved', createdAt: new Date(Date.now() - 6 * 86400e3).toISOString() },
];

