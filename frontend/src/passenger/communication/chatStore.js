/**
 * Chat store (3C-3E) — local, backend-free message store for passenger↔driver
 * communication. Mirrors the shape a real chat/Realtime API would return, so
 * swapping in a WebSocket/Echo-backed implementation later needs no UI changes.
 *
 * Features: message status (sending→sent→delivered→read), typing indicator,
 * unread count, quick replies, and a tiny pub-sub so badges/indicators stay
 * live without a backend.
 *
 * No business logic is duplicated — this is purely a client-side sample store
 * consistent with the rest of the passenger app (sample data, no backend).
 */

import { getQuickReplies } from '../api.js';

let _seq = 0;
const nextId = () => `m${++_seq}`;

const conversations = new Map(); // bookingId -> { messages, unread, typing, active }
const listeners = new Map(); // bookingId -> Set<cb>

function ensure(id) {
  if (!conversations.has(id)) {
    conversations.set(id, { messages: [], unread: 0, typing: false, active: false });
  }
  return conversations.get(id);
}

function notify(id) {
  const set = listeners.get(id);
  if (set) set.forEach((cb) => cb(getSnapshot(id)));
}

export function subscribe(id, cb) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id).add(cb);
  cb(getSnapshot(id));
  return () => listeners.get(id)?.delete(cb);
}

export function getSnapshot(id) {
  const c = ensure(id);
  return { messages: c.messages, unread: c.unread, typing: c.typing };
}

/** Seed a welcome message (used when a conversation starts). */
export function seedIfEmpty(id, driver) {
  const c = ensure(id);
  if (c.messages.length === 0 && driver) {
    c.messages.push({
      id: nextId(), from: 'driver', text: `Halo, saya ${driver.name}. Ada pesan?`,
      ts: Date.now(), status: 'read',
    });
    notify(id);
  }
}

export function getMessages(id) {
  return ensure(id).messages;
}

export function getUnread(id) {
  return ensure(id).unread;
}

export function markRead(id) {
  const c = ensure(id);
  c.unread = 0;
  c.messages.forEach((m) => { if (m.from === 'driver') m.read = true; });
  notify(id);
}

/** Send a passenger message; statuses progress sending→sent→delivered→read. */
export function sendMessage(id, text) {
  const c = ensure(id);
  const msg = { id: nextId(), from: 'me', text, ts: Date.now(), status: 'sending' };
  c.messages.push(msg);
  notify(id);
  // simulated delivery pipeline
  const apply = (status) => {
    const m = c.messages.find((x) => x.id === msg.id);
    if (m) { m.status = status; notify(id); }
  };
  setTimeout(() => apply('sent'), 300);
  setTimeout(() => apply('delivered'), 800);
  setTimeout(() => apply('read'), 1500);
  return msg;
}

/** Simulate the driver typing then replying (sample auto-responder). */
export function simulateDriverReply(id, replyText) {
  const c = ensure(id);
  c.typing = true;
  notify(id);
  setTimeout(() => {
    c.typing = false;
    const msg = { id: nextId(), from: 'driver', text: replyText, ts: Date.now(), status: 'read', read: c.active };
    c.messages.push(msg);
    if (!c.active) c.unread += 1;
    notify(id);
  }, 1400);
}

export function setTyping(id, on) {
  const c = ensure(id);
  c.typing = on;
  notify(id);
}

export function setActive(id, on) {
  const c = ensure(id);
  c.active = on;
  if (on) c.unread = 0;
  notify(id);
}

export function quickReplies() {
  return getQuickReplies();
}
