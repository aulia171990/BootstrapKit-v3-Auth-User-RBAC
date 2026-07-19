import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  subscribe, sendMessage, simulateDriverReply, markRead, getUnread, getMessages, seedIfEmpty,
} from '../chatStore.js';

afterEach(() => { vi.useRealTimers(); });

describe('chatStore (3C-3E)', () => {
  it('sends a message with status progressing sending→sent→delivered→read', () => {
    vi.useFakeTimers();
    const id = 'cs1';
    const msg = sendMessage(id, 'Halo');
    expect(msg.status).toBe('sending');
    vi.advanceTimersByTime(300);
    expect(getMessages(id).find((m) => m.id === msg.id).status).toBe('sent');
    vi.advanceTimersByTime(500);
    expect(getMessages(id).find((m) => m.id === msg.id).status).toBe('delivered');
    vi.advanceTimersByTime(700);
    expect(getMessages(id).find((m) => m.id === msg.id).status).toBe('read');
  });

  it('simulates driver typing then a reply, incrementing unread', () => {
    vi.useFakeTimers();
    const id = 'cs2';
    seedIfEmpty(id, { name: 'Anto' });
    simulateDriverReply(id, 'Sampai sebentar');
    expect(getMessages(id).some((m) => m.text === 'Sampai sebentar')).toBe(false);
    vi.advanceTimersByTime(1400);
    const dm = getMessages(id).find((m) => m.text === 'Sampai sebentar');
    expect(dm && dm.from).toBe('driver');
  });

  it('tracks unread and clears on markRead', () => {
    vi.useFakeTimers();
    const id = 'cs3';
    simulateDriverReply(id, 'Hai');
    vi.advanceTimersByTime(1400);
    expect(getUnread(id)).toBe(1);
    markRead(id);
    expect(getUnread(id)).toBe(0);
  });

  it('publishes snapshots to subscribers', () => {
    const id = 'cs4';
    const cb = vi.fn();
    const off = subscribe(id, cb);
    expect(cb).toHaveBeenCalled();
    sendMessage(id, 'test');
    expect(cb).toHaveBeenCalledTimes(2);
    off();
  });
});
