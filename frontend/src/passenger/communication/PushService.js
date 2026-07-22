let _permission = 'default';
let _token = null;
let _initialized = false;

const _listeners = {
  notification: new Set(),
  tokenRefresh: new Set(),
};

function _notify(type, data) {
  _listeners[type]?.forEach((cb) => { try { cb(data); } catch { /* noop */ } });
}

export function init() {
  if (_initialized) return;
  _initialized = true;
  if (typeof Notification !== 'undefined') {
    _permission = Notification.permission;
  }
  if (_permission === 'granted') {
    _token = `push-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    _notify('tokenRefresh', _token);
  }
}

export async function requestPermission() {
  if (typeof Notification === 'undefined') {
    _permission = 'denied';
    return _permission;
  }
  try {
    const result = await Notification.requestPermission();
    _permission = result;
    if (result === 'granted') {
      _token = `push-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      _notify('tokenRefresh', _token);
    }
    return result;
  } catch {
    _permission = 'denied';
    return 'denied';
  }
}

export function getToken() {
  return _token;
}

export function getPermission() {
  return _permission;
}

export function onNotification(cb) {
  _listeners.notification.add(cb);
  return () => _listeners.notification.delete(cb);
}

export function onTokenRefresh(cb) {
  _listeners.tokenRefresh.add(cb);
  return () => _listeners.tokenRefresh.delete(cb);
}

export async function setBadge(count) {
  if (typeof navigator?.setAppBadge === 'function') {
    try { await navigator.setAppBadge(count); } catch { }
  }
}

export async function clearBadge() {
  if (typeof navigator?.clearAppBadge === 'function') {
    try { await navigator.clearAppBadge(); } catch { }
  }
}

export function destroy() {
  _listeners.notification.clear();
  _listeners.tokenRefresh.clear();
  _initialized = false;
  _token = null;
  _permission = 'default';
}
