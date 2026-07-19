// Passenger-app data access layer.
//
// ONLY `me()` reuses the existing, real backend API (src/api.js -> /auth/me).
// The remaining passenger modules (promotions, wallet, notifications, favorites,
// recent destinations, nearby drivers, recent trips) are NOT yet exposed by the
// backend API client. To avoid fabricating fetch URLs or duplicating backend
// business logic, this file returns clearly-marked SAMPLE data so the UI can be
// built and tested end-to-end. Replace each function body with a real
// `api.<resource>()` call (and add the endpoint to src/api.js) when the backend
// endpoints land — the UI component signatures will not change.

import { api } from '../api.js';

export async function me() {
  // Reuse the real authenticated-user endpoint (no duplication).
  return api.me();
}

// ---- Sample data (replace with real API calls) -------------------------------

export async function getPromotions() {
  return [
    { id: 'p1', title: 'Diskon 50% perjalanan pertama', subtitle: 'Berlaku hari ini', code: 'HALO50', tone: 'primary', kind: 'campaign' },
    { id: 'p2', title: 'Voucher Rp15.000', subtitle: 'Min. pembelanjaan Rp30.000', code: 'JALAN15', tone: 'success', kind: 'voucher' },
    { id: 'p3', title: 'Cashback 20%', subtitle: 'Untuk pengguna baru', code: 'CASH20', tone: 'warning', kind: 'campaign' },
  ];
}

export async function getWallet() {
  return { balance: 125000, currency: 'IDR', pending: 0 };
}

export async function getNotifications() {
  return [
    { id: 'n1', title: 'Driver menunggu di titik jemput', body: 'Anto sedang menuju lokasi Anda', time: '2 mnt lalu', unread: true },
    { id: 'n2', title: 'Promo baru tersedia', body: 'Diskon 50% khusus pagi ini', time: '1 jam lalu', unread: true },
    { id: 'n3', title: 'Trip selesai', body: 'Terima kasih telah menggunakan Ojol', time: 'Kemarin', unread: false },
  ];
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

// ---- Destination search (sample data; replace with a real geocoding/places API) ----
// A small local pool used to mimic a places-autocomplete backend. Swap getPlaceSuggestions
// for a real `api.searchPlaces(q)` call when the endpoint exists.
const PLACE_POOL = [
  { id: 'pl1', title: 'Rumah', subtitle: 'Jl. Merdeka No. 12, Jakarta', icon: 'home', kind: 'saved' },
  { id: 'pl2', title: 'Kantor', subtitle: 'Menara BCA, Jl. Sudirman, Jakarta', icon: 'building', kind: 'saved' },
  { id: 'pl3', title: 'Bandara Soekarno-Hatta T2', subtitle: 'Tangerang, Banten', icon: 'plane', kind: 'airport' },
  { id: 'pl4', title: 'Stasiun Gambir', subtitle: 'Gambir, Jakarta Pusat', icon: 'train', kind: 'transit' },
  { id: 'pl5', title: 'Kafe Senja', subtitle: 'Jl. Gadjah Mada No. 8, Jakarta', icon: 'coffee', kind: 'food' },
  { id: 'pl6', title: 'RS Hermina', subtitle: 'Jl. Raden Saleh No. 3, Jakarta', icon: 'heart', kind: 'health' },
  { id: 'pl7', title: 'Mal Grand Indonesia', subtitle: 'Jl. M.H. Thamrin, Jakarta', icon: 'shopping-bag', kind: 'mall' },
  { id: 'pl8', title: 'Universitas Indonesia', subtitle: 'Depok, Jawa Barat', icon: 'graduation-cap', kind: 'campus' },
  { id: 'pl9', title: 'Pasar Tanah Abang', subtitle: 'Jl. KH. Mas Mansyur, Jakarta', icon: 'shopping-cart', kind: 'market' },
  { id: 'pl10', title: 'Taman Mini Indonesia Indah', subtitle: 'Jl. Raya Taman Mini, Jakarta Timur', icon: 'tree', kind: 'park' },
];

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

// Saved pickup points are the user's favorite places (reuse, no duplication).
export async function getSavedPickups() {
  return getFavorites();
}
// Pickup search reuses the same places pool as destination search.
export async function getPickupSuggestions(query) {
  return getPlaceSuggestions(query);
}

// ---- Booking (sample data; replace with a real booking API call) ----
// Accepts the passenger's confirmed selection and returns a booking record
// with a status. Swap for `api.createBooking(...)` when the endpoint lands —
// the component signatures will not change.
export async function createBooking(payload) {
  // Simulate network latency + success.
  await new Promise((r) => setTimeout(r, 900));
  const id = 'BK' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    id,
    status: 'waiting_driver',
    vehicle: payload?.vehicle?.id || 'car',
    pickup: payload?.pickup,
    destination: payload?.destination,
    fare: payload?.fare?.finalFare || 0,
    currency: payload?.fare?.currency || 'IDR',
    paymentMethod: payload?.method || 'wallet',
    createdAt: new Date().toISOString(),
  };
}

export async function getBooking(id) {
  return { id, status: 'waiting_driver' };
}

// Cancel an in-progress (not yet assigned) booking. Sample; swap for real call.
export async function cancelBooking(id, reason = 'passenger') {
  await new Promise((r) => setTimeout(r, 400));
  return { id, status: 'cancelled', reason };
}

// Share a trip: returns a shareable tracking link. Sample; swap for real call.
export async function shareTrip(id) {
  await new Promise((r) => setTimeout(r, 300));
  const token = btoa(`trip:${id}:${Date.now()}`).replace(/=+$/, '');
  return { id, url: `https://ojol.test/t/${token}`, expiresIn: 3600 };
}

// Stop a trip (operator only). Sample; swap for real call.
export async function stopTrip(id, note = '') {
  await new Promise((r) => setTimeout(r, 300));
  return { id, status: 'stopped_by_operator', note };
}

// Quick replies for passenger↔driver chat. Sample; swap for real list.
export async function getQuickReplies() {
  return [
    'Saya sudah di titik jemput',
    'Tolong tunggu sebentar',
    'Di mana posisi Anda sekarang?',
    'Terima kasih',
    'Boleh lewat jalan tol?',
  ];
}

// ---- Safety (sample data; replace with a real safety/dispatch API) ----
// Returns the passenger's emergency contacts.
export async function getEmergencyContacts() {
  await new Promise((r) => setTimeout(r, 300));
  return [
    { id: 'ec1', name: 'Ibu', phone: '+62811111111', relation: 'Keluarga' },
    { id: 'ec2', name: 'Budi', phone: '+62812222222', relation: 'Teman' },
  ];
}

// Adds an emergency contact. Sample; swap for real call.
export async function addEmergencyContact(contact) {
  await new Promise((r) => setTimeout(r, 300));
  return { id: `ec${Date.now()}`, ...contact };
}

// Triggers an SOS alert to the safety/dispatch backend. Sample; swap for real call.
export async function triggerSos(bookingId, payload = {}) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: `sos-${Date.now()}`, bookingId, status: 'dispatched', ...payload };
}

// Returns the trip verification code (share with trusted contacts to verify driver).
export async function getVerificationCode(bookingId) {
  await new Promise((r) => setTimeout(r, 200));
  const seed = String(bookingId || 'trip').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const code = (1000 + (seed % 9000)).toString();
  return { bookingId, code };
}

// ---- Trip completion summary (sample data; replace with a real trip API) ----
// Returns fare, distance, duration, payment status for the completed trip.
export async function getTripSummary(bookingId) {
  await new Promise((r) => setTimeout(r, 300));
  return {
    bookingId,
    fare: 38500,
    currency: 'IDR',
    distanceKm: 8.4,
    durationMin: 22,
    paymentStatus: 'paid', // paid | pending | failed
    paymentMethod: 'Wallet',
    vehicle: 'Mobil',
    rating: null,
    // Promo applied to the trip (used by the receipt, 3H). Mirrors the Payment
    // module's promo shape so the same codes/discounts render consistently.
    promo: { code: 'JALAN15', title: 'Diskon perjalanan', amount: 15000, tone: 'success' },
    invoiceNo: `INV-${bookingId || 'TRIP'}-${new Date().getFullYear()}`,
    issuedAt: new Date().toISOString(),
  };
}

// ---- Booking route (sample data; replace with a real routing/directions API) ----
// Returns a sample route between two points: distance, duration, fare, and a
// polyline of percentage coords [x%, y%] for the library-agnostic map overlay.
export async function getRoute(from, to) {
  const a = from?.address || 'Titik jemput';
  const b = to?.address || to?.title || 'Tujuan';
  return {
    from: a, to: b,
    distanceKm: 8.4,
    durationMin: 22,
    fare: 38500,
    currency: 'IDR',
    // polyline points: pickup (bottom-left) → destination (top-right), gentle curve
    points: [[18, 78], [34, 66], [50, 52], [62, 40], [78, 26]],
  };
}


