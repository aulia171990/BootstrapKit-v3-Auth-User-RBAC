import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  init, requestPermission, getToken, getPermission,
  onNotification, onTokenRefresh, setBadge, clearBadge, destroy,
} from '../PushService.js';

beforeEach(() => {
  destroy();
  vi.restoreAllMocks();
  globalThis.Notification = undefined;
  globalThis.navigator = {};
});

afterEach(() => {
  destroy();
});

describe('PushService — 6F', () => {
  it('init does nothing if Notification API is unavailable', () => {
    init();
    expect(getToken()).toBeNull();
    expect(getPermission()).toBe('default');
  });

  it('init checks existing permission when Notification exists', () => {
    globalThis.Notification = { permission: 'granted' };
    init();
    expect(getPermission()).toBe('granted');
    expect(getToken()).toBeTruthy();
    expect(getToken()).toMatch(/^push-/);
  });

  it('init does not re-initialize', () => {
    globalThis.Notification = { permission: 'granted' };
    init();
    const t1 = getToken();
    init();
    expect(getToken()).toBe(t1);
  });

  it('requestPermission grants and sets token', async () => {
    globalThis.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    };
    const result = await requestPermission();
    expect(result).toBe('granted');
    expect(getToken()).toBeTruthy();
    expect(getToken()).toMatch(/^push-/);
  });

  it('requestPermission denied returns denied', async () => {
    globalThis.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    };
    const result = await requestPermission();
    expect(result).toBe('denied');
    expect(getToken()).toBeNull();
  });

  it('requestPermission falls back to denied on error', async () => {
    globalThis.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockRejectedValue(new Error('blocked')),
    };
    const result = await requestPermission();
    expect(result).toBe('denied');
  });

  it('requestPermission returns denied when Notification is undefined', async () => {
    const result = await requestPermission();
    expect(result).toBe('denied');
  });

  it('onNotification registers and receives callbacks', () => {
    const cb = vi.fn();
    const unsub = onNotification(cb);
    init();
    expect(unsub).toBeTypeOf('function');
    unsub();
  });

  it('onTokenRefresh fires when permission is granted', () => {
    globalThis.Notification = { permission: 'granted' };
    const cb = vi.fn();
    onTokenRefresh(cb);
    init();
    expect(cb).toHaveBeenCalledOnce();
    expect(cb.mock.calls[0][0]).toMatch(/^push-/);
  });

  it('onTokenRefresh does not fire when permission is denied', () => {
    globalThis.Notification = { permission: 'denied' };
    const cb = vi.fn();
    onTokenRefresh(cb);
    init();
    expect(cb).not.toHaveBeenCalled();
  });

  it('setBadge and clearBadge call navigator methods when available', async () => {
    const setAppBadge = vi.fn().mockResolvedValue(undefined);
    const clearAppBadge = vi.fn().mockResolvedValue(undefined);
    globalThis.navigator = { setAppBadge, clearAppBadge };
    await setBadge(5);
    expect(setAppBadge).toHaveBeenCalledWith(5);
    await clearBadge();
    expect(clearAppBadge).toHaveBeenCalled();
  });

  it('setBadge does not throw when navigator.setAppBadge is absent', async () => {
    await expect(setBadge(5)).resolves.toBeUndefined();
  });

  it('destroy clears all listeners and state', () => {
    globalThis.Notification = { permission: 'granted' };
    init();
    expect(getToken()).toBeTruthy();
    destroy();
    expect(getToken()).toBeNull();
    expect(getPermission()).toBe('default');
  });
});
