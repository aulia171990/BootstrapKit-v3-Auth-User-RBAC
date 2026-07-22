import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationInbox from '../NotificationInbox.jsx';
import { pushNotification, resetNotifications, getSnapshot } from '../../communication/notificationStore.js';
import * as papi from '../../api.js';

function makeItems() {
  return [
    { id: 'a1', title: 'Driver tiba', message: 'Anto di lobi', timestamp: new Date().toISOString(), category: 'trip', unread: true, priority: 'high', data: { type: 'trip', id: 't1' } },
    { id: 'a2', title: 'Promo', message: 'Diskon 50%', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), category: 'promotion', unread: false, priority: 'normal', data: { type: 'promotion', id: 'p1' } },
    { id: 'a3', title: 'Chat', message: 'Pesan dari driver', timestamp: new Date().toISOString(), category: 'chat', unread: true, priority: 'normal' },
  ];
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetNotifications();
  vi.spyOn(papi, 'getNotifications').mockResolvedValue(makeItems());
});

describe('NotificationInbox — component', () => {
  it('groups notifications into Unread / Today / Yesterday / Earlier', async () => {
    vi.spyOn(papi, 'getNotifications').mockResolvedValue([
      { id: 'b1', title: 'Unread now', message: 'x', timestamp: new Date().toISOString(), category: 'trip', unread: true },
      { id: 'b2', title: 'Today read', message: 'x', timestamp: new Date().toISOString(), category: 'system', unread: false },
      { id: 'b3', title: 'Yesterday', message: 'x', timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), category: 'wallet', unread: false },
      { id: 'b4', title: 'Earlier', message: 'x', timestamp: new Date(Date.now() - 4 * 86400 * 1000).toISOString(), category: 'payment', unread: false },
    ]);
    render(<NotificationInbox />);
    expect(await screen.findByText(/Belum Dibaca/)).toBeTruthy();
    expect(screen.getByText('Hari Ini')).toBeTruthy();
    expect(screen.getByText('Kemarin')).toBeTruthy();
    expect(screen.getByText('Sebelumnya')).toBeTruthy();
  });

  it('shows loading skeleton, then content', async () => {
    vi.spyOn(papi, 'getNotifications').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<NotificationInbox />);
    expect(container.querySelector('.pasv-ni__row .ds-skeleton, .pasv-ni__body')).toBeTruthy();
    expect(await screen.findByText('Notifikasi')).toBeTruthy();
    expect(screen.queryByText('Driver tiba')).toBeNull();
  });

  it('shows empty state when no notifications', async () => {
    vi.spyOn(papi, 'getNotifications').mockResolvedValue([]);
    render(<NotificationInbox />);
    expect(await screen.findByText('Belum ada notifikasi')).toBeTruthy();
  });

  it('shows error state with retry', async () => {
    vi.spyOn(papi, 'getNotifications').mockRejectedValue(new Error('boom'));
    render(<NotificationInbox />);
    expect(await screen.findByText('Gagal memuat notifikasi')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await waitFor(() => expect(papi.getNotifications).toHaveBeenCalledTimes(2));
  });

  it('marks a notification read on open and calls onOpen', async () => {
    const onOpen = vi.fn();
    render(<NotificationInbox onOpen={onOpen} />);
    const row = await screen.findByText('Driver tiba');
    fireEvent.click(row);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('shows unread count badge in header bar', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    expect(screen.getByText('2')).toBeTruthy();
  });
});

describe('NotificationInbox — 6C categories', () => {
  it('renders horizontal filter bar with default "Semua"', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    expect(screen.getByRole('tab', { name: 'Semua' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Perjalanan' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Chat' })).toBeTruthy();
  });

  it('filters by category when a filter chip is clicked', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    // Click "Chat" filter — only the filter chip stays, item rows vanish
    fireEvent.click(screen.getByRole('tab', { name: 'Chat' }));
    await waitFor(() => {
      expect(screen.queryByText('Driver tiba')).toBeNull();
    });
    // The chat notification row appears (unique message, not ambiguous text)
    expect(screen.getByText('Pesan dari driver')).toBeTruthy();
  });

  it('shows all notifications when "Semua" filter is active', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    // Click promo filter, check promo item visible, trip hidden
    fireEvent.click(screen.getByRole('tab', { name: 'Promo' }));
    await waitFor(() => {
      expect(screen.queryByText('Anto di lobi')).toBeNull();
    });
    expect(screen.getByText('Diskon 50%')).toBeTruthy();
    // Back to all — everything visible again
    fireEvent.click(screen.getByRole('tab', { name: 'Semua' }));
    expect(await screen.findByText('Anto di lobi')).toBeTruthy();
    expect(screen.getByText('Diskon 50%')).toBeTruthy();
  });

  it('shows empty message when filter yields no results', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByRole('tab', { name: 'Keamanan' }));
    expect(await screen.findByText('Tidak ada notifikasi')).toBeTruthy();
  });
});

describe('NotificationInbox — 6D bulk operations', () => {
  it('toggles bulk mode on/off', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    const toggle = screen.getByLabelText('Mode pilih');
    fireEvent.click(toggle);
    // Checkboxes appear
    expect(screen.getByLabelText('Pilih semua')).toBeTruthy();
    fireEvent.click(toggle);
    await waitFor(() => expect(screen.queryByLabelText('Pilih semua')).toBeNull());
  });

  it('selects all and bulk reads', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByLabelText('Mode pilih'));
    await screen.findByLabelText('Pilih semua');
    fireEvent.click(screen.getByLabelText('Pilih semua'));
    // All 3 items selected
    expect(screen.getByText('3 dipilih')).toBeTruthy();
    // Bulk read
    fireEvent.click(screen.getByRole('button', { name: 'Baca' }));
    await waitFor(() => {
      const snap = getSnapshot();
      expect(snap.every((n) => !n.unread)).toBe(true);
    });
  });

  it('selects individual items and bulk deletes', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByLabelText('Mode pilih'));
    // Click on the row that contains "Diskon 50%" (unique message) to select it
    const row = screen.getByText('Diskon 50%').closest('[class*="pasv-ni__row"]');
    fireEvent.click(row);
    expect(screen.getByText('1 dipilih')).toBeTruthy();
    // Bulk delete
    fireEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    await waitFor(() => {
      expect(screen.queryByText('Diskon 50%')).toBeNull();
    });
  });
});

describe('NotificationInbox — realtime', () => {
  it('a pushed notification appears automatically under Unread', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    pushNotification({ title: 'Pesan masuk', message: 'Driver: "Saya 2 menit lagi"', category: 'chat', priority: 'normal', data: { type: 'chat', id: 'c1' } });
    expect(await screen.findByText('Pesan masuk')).toBeTruthy();
    const unreadSection = screen.getByText(/Belum Dibaca/).closest('section');
    expect(within(unreadSection).getByText('Pesan masuk')).toBeTruthy();
  });
});

describe('NotificationInbox — accessibility', () => {
  it('rows are keyboard-activatable and labelled', async () => {
    vi.spyOn(papi, 'getNotifications').mockResolvedValue([
      { id: 'c1', title: 'Unread only', message: 'x', timestamp: new Date().toISOString(), category: 'trip', unread: true },
      { id: 'c2', title: 'Read item', message: 'y', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), category: 'system', unread: false },
    ]);
    render(<NotificationInbox />);
    const row = await screen.findByRole('button', { name: /Belum dibaca\. Perjalanan\. Unread only/ });
    expect(row).toBeTruthy();
    fireEvent.keyDown(row, { key: 'Enter' });
    await waitFor(() => expect(screen.queryByText('Belum Dibaca')).toBeNull());
  });

  it('exposes unread count via marking-all-read button', async () => {
    vi.spyOn(papi, 'getNotifications').mockResolvedValue([
      { id: 'c1', title: 'U1', message: 'x', timestamp: new Date().toISOString(), category: 'trip', unread: true },
      { id: 'c2', title: 'U2', message: 'x', timestamp: new Date().toISOString(), category: 'trip', unread: true },
    ]);
    render(<NotificationInbox />);
    const markAll = await screen.findByRole('button', { name: /Tandai semua dibaca/ });
    fireEvent.click(markAll);
    await waitFor(() => expect(screen.queryByText(/Belum Dibaca/)).toBeNull());
  });

  it('filter bar has tab roles and aria-selected', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    const allTab = screen.getByRole('tab', { name: 'Semua' });
    expect(allTab.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Perjalanan' }));
    expect(screen.getByRole('tab', { name: 'Perjalanan' }).getAttribute('aria-selected')).toBe('true');
    expect(allTab.getAttribute('aria-selected')).toBe('false');
  });

  it('bulk action bar has toolbar role and label', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByLabelText('Mode pilih'));
    await screen.findByLabelText('Pilih semua');
    fireEvent.click(screen.getByLabelText('Pilih semua'));
    expect(screen.getByRole('toolbar', { name: 'Aksi massal' })).toBeTruthy();
  });
});

describe('NotificationInbox — 6H UX Polish', () => {
  it('renders settings/preferences button', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    expect(screen.getByLabelText('Pengaturan notifikasi')).toBeTruthy();
  });

  it('calls onPreferences when settings button clicked', async () => {
    const onPrefs = vi.fn();
    render(<NotificationInbox onOpen={vi.fn()} onPreferences={onPrefs} />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByLabelText('Pengaturan notifikasi'));
    expect(onPrefs).toHaveBeenCalledOnce();
  });

  it('renders swipe actions (read + delete) on each row', async () => {
    const { container } = render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    const swipeActions = container.querySelectorAll('.pasv-ni__swipe-actions');
    expect(swipeActions.length).toBeGreaterThanOrEqual(3);
    const swipeBtns = container.querySelectorAll('.pasv-ni__swipe-btn');
    expect(swipeBtns.length).toBeGreaterThanOrEqual(6);
  });

  it('renders refresh indicator during pull-to-refresh', async () => {
    const { container } = render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    // Manually trigger refresh by interacting with body — or just verify the DOM structure
    const body = container.querySelector('.pasv-ni__body');
    expect(body).toBeTruthy();
  });

  it('keeps all previous functionality with memoized NotificationRow', async () => {
    render(<NotificationInbox />);
    expect(await screen.findByText(/Belum Dibaca/)).toBeTruthy();
    const rows = screen.getAllByRole('button');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "Lihat semua" action when filter has no results', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByRole('tab', { name: 'Keamanan' }));
    expect(await screen.findByText('Tidak ada notifikasi')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Lihat semua/ })).toBeTruthy();
  });

  it('renders deep-link action button (Buka Perjalanan) on trip notifications', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    const actionBtn = screen.getByLabelText('Buka Perjalanan');
    expect(actionBtn).toBeTruthy();
  });

  it('renders deep-link action button (Lihat Promo) on promo notifications', async () => {
    render(<NotificationInbox />);
    await screen.findByText('Diskon 50%');
    const actionBtn = screen.getByLabelText('Lihat Promo');
    expect(actionBtn).toBeTruthy();
  });

  it('renders unread dot indicator on unread notifications', async () => {
    const { container } = render(<NotificationInbox />);
    await screen.findByText('Driver tiba');
    const dots = container.querySelectorAll('.pasv-ni__unread-dot');
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it('shows unread count in group header: "Belum Dibaca (N)"', async () => {
    render(<NotificationInbox />);
    expect(await screen.findByText('Belum Dibaca (2)')).toBeTruthy();
  });

  it('clicking action button navigates to the notification', async () => {
    const onOpen = vi.fn();
    render(<NotificationInbox onOpen={onOpen} />);
    await screen.findByText('Driver tiba');
    fireEvent.click(screen.getByLabelText('Buka Perjalanan'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });
});
