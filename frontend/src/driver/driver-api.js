import { api, getToken, setToken, clearToken } from '../api.js';

export { getToken, setToken, clearToken };

const DEMO = true;

async function liveOrFallback(fn, fallback) {
  if (!DEMO) return fn();
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('api-timeout')), 2500)),
    ]);
  } catch { return fallback(); }
}

export const driverAPI = {
  profile: () => api.me(),

  earnings: () => api.walletBalance(),

  todayEarnings: () => liveOrFallback(
    () => api.trips('per_page=1&sort=desc').then(() => ({ total: 0, trips: 0, cash: 0, bonus: 0 })),
    () => ({ total: 185000, trips: 8, cash: 45000, bonus: 15000 }),
  ),

  weeklyEarnings: () => liveOrFallback(
    () => api.trips('per_page=1&sort=desc').then(() => ({ total: 0, trips: 0 })),
    () => ({ total: 1250000, trips: 42, bonus: 120000 }),
  ),

  monthlyEarnings: () => liveOrFallback(
    () => api.trips('per_page=1&sort=desc').then(() => ({ total: 0, trips: 0 })),
    () => ({ total: 4850000, trips: 168, bonus: 450000 }),
  ),

  activeTrip: () => api.trips('status=in_progress&limit=1'),
  trips: (params) => api.trips(params),
  trip: (id) => api.trip(id),
  orderTrack: (id) => api.orderTrack(id),

  notifications: () => api.notifications(),
  notificationUnread: () => api.notificationUnread(),
  notificationMarkRead: (ids) => api.notificationMarkRead(ids),
  notificationMarkAllRead: () => api.notificationMarkAllRead(),
  notificationPreferences: () => api.notificationPreferences(),
  notificationUpdatePreferences: (prefs) => api.notificationUpdatePreferences(prefs),

  walletBalance: () => api.walletBalance(),
  walletTransactions: (limit) => api.walletTransactions(limit),
  walletTopup: (amount) => api.walletTopup(amount),

  promotions: () => api.promotions(),

  updateLocation: (lat, lng) => api('/drivers/location', { method: 'POST', body: JSON.stringify({ latitude: lat, longitude: lng }) }),

  acceptOrder: (id) => api.acceptOrder(id),
  updateOrderStatus: (id, status) => api.updateStatus(id, status),
  updateOrderLocation: (id, lat, lng) => api('/orders/' + id + '/location', { method: 'POST', body: JSON.stringify({ latitude: lat, longitude: lng }) }),

  driverStatus: () => liveOrFallback(
    () => api('/drivers').then((d) => {
      const driver = Array.isArray(d) ? d[0] : d;
      return {
        isOnline: driver?.is_online || driver?.online_status === 'online',
        zone: driver?.zone || 'Jakarta Pusat',
        todayTrips: driver?.today_trips || 0,
        acceptanceRate: driver?.acceptance_rate || 0,
        rating: driver?.rating || 0,
        vehicle: driver?.vehicle || {},
        driverCode: driver?.driver_code || '',
      };
    }),
    () => ({
      isOnline: true, zone: 'Jakarta Pusat', todayTrips: 8,
      acceptanceRate: 97.5, rating: 4.9,
      vehicle: { plate: 'B 1234 ABC', type: 'motor', model: 'Honda Vario' },
      driverCode: 'DRV-001',
    }),
  ),

  updateOnlineStatus: (status) => api('/drivers/location', { method: 'POST', body: JSON.stringify({ status }) }),

  sosTrigger: (payload) => api('/trips/' + (payload?.tripId || '') + '/sos', { method: 'POST', body: JSON.stringify(payload || {}) }),

  vehicle: () => liveOrFallback(
    () => api('/drivers/vehicle').then((v) => v || {}),
    () => ({ plate: 'B 1234 ABC', type: 'motor', model: 'Honda Vario', color: 'Hitam', year: '2021', brand: 'Honda' }),
  ),

  updateVehicle: (data) => api('/drivers/vehicle', { method: 'PUT', body: JSON.stringify(data) }),

  documents: () => liveOrFallback(
    () => api('/drivers/documents').then((d) => {
      const map = {};
      (Array.isArray(d) ? d : []).forEach((doc) => { map[doc.type] = { status: doc.status, url: doc.url }; });
      return map;
    }),
    () => ({
      ktp: { status: 'verified', url: '#' },
      sim: { status: 'verified', url: '#' },
      stnk: { status: 'pending', url: '#' },
      vehicle_photo: { status: 'rejected', url: '#' },
      selfie: { status: 'verified', url: '#' },
    }),
  ),

  uploadDocument: (type, file) => {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    return api('/drivers/documents', { method: 'POST', body: fd });
  },

  driverRating: () => liveOrFallback(
    () => api('/drivers/rating').then((r) => ({ rating: r?.rating || 0, total_reviews: r?.total || 0 })),
    () => ({ rating: 4.9, total_reviews: 128 }),
  ),

  driverReviews: (page) => api('/drivers/reviews?page=' + (page || 1)),

  supportTickets: () => api('/support/tickets'),

  supportCreateTicket: (data) => api('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),

  driverSettings: () => liveOrFallback(
    () => api('/drivers/settings').then((s) => s || {}),
    () => ({
      sound: true, vibrate: true, new_order_sound: true, promo: false,
      nav_app: 'Google Maps', auto_nav: false, auto_accept: false,
      max_distance: '10 km', pref_area: 'Jakarta Pusat',
    }),
  ),

  updateDriverSettings: (data) => api('/drivers/settings', { method: 'PUT', body: JSON.stringify(data) }),

  emergencyContacts: () => liveOrFallback(
    () => api.me().then(() => [
      { id: 'ec1', name: 'Ibu', phone: '+6281111111111', relation: 'Keluarga' },
    ]),
    () => [
      { id: 'ec1', name: 'Ibu', phone: '+6281111111111', relation: 'Keluarga' },
      { id: 'ec2', name: 'Ahmad (Teman)', phone: '+6282222222222', relation: 'Teman' },
    ],
  ),
};
