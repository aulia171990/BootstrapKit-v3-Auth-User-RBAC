import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationDetail from '../NotificationDetail.jsx';
import { resetNotifications, setNotifications, getSnapshot } from '../../communication/notificationStore.js';
import * as papi from '../../api.js';

const base = {
  id: 'n1', title: 'Driver menunggu di titik jemput', message: 'Anto sedang menuju lokasi Anda.',
  timestamp: new Date().toISOString(), category: 'trip', unread: true, priority: 'high',
  data: { type: 'trip', id: 't1' },
};

beforeEach(() => {
  vi.restoreAllMocks();
  resetNotifications();
  setNotifications([base]);
});

describe('NotificationDetail — 6B', () => {
  it('renders rich content (category, title, message, timestamp, priority)', () => {
    render(<NotificationDetail notification={base} onBack={() => {}} />);
    expect(screen.getByText('Driver menunggu di titik jemput')).toBeTruthy();
    expect(screen.getByText(/Anto sedang menuju/)).toBeTruthy();
    expect(screen.getByText('Perjalanan')).toBeTruthy(); // category badge
    expect(screen.getByText('Penting')).toBeTruthy(); // priority
    expect(screen.getByText('Belum dibaca')).toBeTruthy(); // unread
    // absolute timestamp
    expect(screen.getByText(/\d{1,2} \w+ \d{4}/)).toBeTruthy();
  });

  it('shows "Open Related Trip" for trip notifications and navigates', () => {
    const onOpenRelated = vi.fn();
    render(<NotificationDetail notification={base} onOpenRelated={onOpenRelated} onBack={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Buka Perjalanan Terkait' });
    fireEvent.click(btn);
    expect(onOpenRelated).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });

  it('shows Open Promotion / Open Wallet / Open Booking based on data.type', () => {
    const promo = { ...base, id: 'p1', category: 'promotion', data: { type: 'promotion', id: 'pr1' } };
    const { rerender } = render(<NotificationDetail notification={promo} onBack={() => {}} />);
    expect(screen.getByRole('button', { name: 'Buka Promo' })).toBeTruthy();

    const wallet = { ...base, id: 'w1', category: 'wallet', data: { type: 'wallet' } };
    rerender(<NotificationDetail notification={wallet} onBack={() => {}} />);
    expect(screen.getByRole('button', { name: 'Buka Dompet' })).toBeTruthy();

    const booking = { ...base, id: 'b1', category: 'booking', data: { type: 'booking', id: 'bk1' } };
    rerender(<NotificationDetail notification={booking} onBack={() => {}} />);
    expect(screen.getByRole('button', { name: 'Buka Pesanan Terkait' })).toBeTruthy();
  });

  it('marks read on button click', async () => {
    render(<NotificationDetail notification={base} onBack={() => {}} />);
    const markBtn = screen.getByRole('button', { name: 'Tandai Dibaca' });
    fireEvent.click(markBtn);
    // store updated
    await waitFor(() => expect(getSnapshot().find((n) => n.id === 'n1')?.unread).toBe(false));
  });

  it('shares via onShare', () => {
    const onShare = vi.fn();
    render(<NotificationDetail notification={base} onShare={onShare} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bagikan' }));
    expect(onShare).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });

  it('handles missing notification gracefully', () => {
    render(<NotificationDetail notification={null} onBack={() => {}} />);
    expect(screen.getByText('Notifikasi tidak ditemukan')).toBeTruthy();
  });
});
