/**
 * Notification store (Sprint 6, 3F) — client-side notification center.
 *
 * Mirrors the shape a real backend / Reverb channel would return, so swapping
 * in a WebSocket/Echo-backed implementation later needs no UI changes. This is
 * consistent with chatStore.js: no backend, pure client sample data + pub/sub
 * so the NotificationBell badge and the NotificationInbox stay live in realtime.
 *
 * CONTRACT (a notification):
 *   { id, title, message, timestamp (ISO), category, unread, priority, data }
 *   category ∈ support|booking|trip|payment|wallet|promotion|system|chat|security
 *   priority ∈ low|normal|high
 *   data      opaque deep-link payload (e.g. { type:'trip', id } )
 *
 * No business logic is duplicated — this is purely a client-side store that
 * reuses the passenger api layer (getNotifications) for the initial fetch.
 */

let _seq = 1000;
const nextId = () => `n${++_seq}`;

// In-memory list (seeded empty; real data fetched via API and set with setNotifications()).
let _list = null;
const listeners = new Set();

function seedIfEmpty() {
  if (_list) return;
  // Start with an empty list; real notifications are loaded via API and populated
  // by calling setNotifications().
  _list = [];
}

function normalize(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.message || n.body || '',
    timestamp: n.timestamp || n.time,
    category: n.category || guessCategory(n.title),
    unread: !!n.unread,
    priority: n.priority || 'normal',
    data: n.data || null,
  };
}

/** Reset the in-memory store (test helper / dev reload). Re-seeds on next use. */
export function resetNotifications() {
  _list = null;
}

/** Replace the store contents (used after the API load so mocks/tests apply). */
export function setNotifications(list) {
  _list = (list || []).map(normalize);
  notify();
}

function guessCategory(title = '') {
  const t = title.toLowerCase();
  if (/promo|diskon|voucher/.test(t)) return 'promotion';
  if (/trip|perjalanan|driver/.test(t)) return 'trip';
  if (/bayar|pembayaran|tagihan/.test(t)) return 'payment';
  if (/dompet|saldo|wallet/.test(t)) return 'wallet';
  if (/pesan|chat|balasan/.test(t)) return 'chat';
  if (/aman|keamanan|login|password/.test(t)) return 'security';
  if (/bantuan|keluhan|lapor/.test(t)) return 'support';
  if (/booking|pesanan/.test(t)) return 'booking';
  return 'system';
}

function notify() { listeners.forEach((cb) => cb(getSnapshot())); }

export function getSnapshot() {
  seedIfEmpty();
  return _list.map((n) => ({ ...n }));
}

export function subscribe(cb) {
  seedIfEmpty();
  listeners.add(cb);
  cb(getSnapshot());
  return () => listeners.delete(cb);
}

export function getUnreadCount() {
  seedIfEmpty();
  return _list.filter((n) => n.unread).length;
}

export function getNotification(id) {
  seedIfEmpty();
  return _list.find((x) => x.id === id) || null;
}

export function markRead(id) {
  seedIfEmpty();
  const n = _list.find((x) => x.id === id);
  if (n && n.unread) { n.unread = false; notify(); }
}

export function markAllRead() {
  seedIfEmpty();
  let changed = false;
  _list.forEach((n) => { if (n.unread) { n.unread = false; changed = true; } });
  if (changed) notify();
}

export function deleteNotification(id) {
  seedIfEmpty();
  const before = _list.length;
  _list = _list.filter((x) => x.id !== id);
  if (_list.length !== before) notify();
}

export function markBulkRead(ids) {
  seedIfEmpty();
  let changed = false;
  _list.forEach((n) => { if (ids.includes(n.id) && n.unread) { n.unread = false; changed = true; } });
  if (changed) notify();
}

export function deleteBulkNotifications(ids) {
  seedIfEmpty();
  const before = _list.length;
  _list = _list.filter((x) => !ids.includes(x.id));
  if (_list.length !== before) notify();
}

/**
 * Push a new notification (realtime). Appears automatically in the inbox and
 * bumps the bell badge. When the backend ships a Reverb channel, call this from
 * the channel listener — the UI needs no other change.
 */
export function pushNotification(n) {
  seedIfEmpty();
  const item = {
    id: n.id || nextId(),
    title: n.title || 'Notifikasi baru',
    message: n.message || n.body || '',
    timestamp: n.timestamp || new Date().toISOString(),
    category: n.category || guessCategory(n.title),
    unread: n.unread !== false,
    priority: n.priority || 'normal',
    data: n.data || null,
  };
  _list = [item, ..._list];
  notify();
  return item;
}

/** Demo helper used by realtime tests / dev: emit a sample incoming notification. */
export function simulateNotification(overrides = {}) {
  return pushNotification({
    title: 'Driver sudah tiba di titik jemput',
    message: 'Anto sedang menunggu Anda di depan lobi.',
    category: 'trip',
    priority: 'high',
    data: { type: 'trip', id: 't-sim' },
    ...overrides,
  });
}
