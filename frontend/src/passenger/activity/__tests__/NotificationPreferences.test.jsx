import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationPreferences from '../NotificationPreferences.jsx';
import * as papi from '../../api.js';

const DEFAULT_PREFS = {
  push_enabled: true,
  email_enabled: false,
  sms_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  language: 'id',
  categories: {
    booking: true, trip: true, payment: true, wallet: true,
    promotion: true, chat: true, security: true, system: false,
  },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('NotificationPreferences — 6E', () => {
  it('renders all sections (channel, category, quiet hours, language)', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    render(<NotificationPreferences onBack={vi.fn()} />);
    expect(await screen.findByText('Pengaturan Notifikasi')).toBeTruthy();
    expect(screen.getByText('Saluran Notifikasi')).toBeTruthy();
    expect(screen.getByText('Kategori Notifikasi')).toBeTruthy();
    expect(screen.getByText('Jam Tenang (Quiet Hours)')).toBeTruthy();
    expect(screen.getByText('Bahasa')).toBeTruthy();
  });

  it('shows loading skeleton initially', () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<NotificationPreferences onBack={vi.fn()} />);
    expect(container.querySelector('.ds-skeleton')).toBeTruthy();
  });

  it('renders all category switches', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Pesanan');
    expect(screen.getByText('Perjalanan')).toBeTruthy();
    expect(screen.getByText('Pembayaran')).toBeTruthy();
    expect(screen.getByText('Dompet')).toBeTruthy();
    expect(screen.getByText('Promo')).toBeTruthy();
    expect(screen.getByText('Chat')).toBeTruthy();
    expect(screen.getByText('Keamanan')).toBeTruthy();
    expect(screen.getByText('Sistem')).toBeTruthy();
  });

  it('toggles a category switch and saves', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    const updateSpy = vi.spyOn(papi, 'updateNotificationPreferences').mockResolvedValue({ ok: true });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Push Notification');

    const systemSwitch = screen.getByText('Sistem').closest('.pasv-np__row').querySelector('input');
    expect(systemSwitch).toBeTruthy();
    expect(systemSwitch.checked).toBe(false);
    fireEvent.click(systemSwitch);
    expect(systemSwitch.checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pengaturan' }));
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
      const saved = updateSpy.mock.calls[0][0];
      expect(saved.categories.system).toBe(true);
    });
  });

  it('toggles push/email/SMS channels', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Push Notification');

    const emailSwitch = screen.getByText('Email').closest('.pasv-np__row').querySelector('input');
    expect(emailSwitch.checked).toBe(false);
    fireEvent.click(emailSwitch);
    expect(emailSwitch.checked).toBe(true);
  });

  it('calls onBack when back button clicked', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    const onBack = vi.fn();
    render(<NotificationPreferences onBack={onBack} />);
    await screen.findByText('Pengaturan Notifikasi');
    fireEvent.click(screen.getByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows success toast on save', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    vi.spyOn(papi, 'updateNotificationPreferences').mockResolvedValue({ ok: true });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Push Notification');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pengaturan' }));
    expect(await screen.findByText('Pengaturan berhasil disimpan')).toBeTruthy();
  });

  it('shows error toast on save failure', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    vi.spyOn(papi, 'updateNotificationPreferences').mockRejectedValue(new Error('fail'));
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Push Notification');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pengaturan' }));
    expect(await screen.findByText('Gagal menyimpan pengaturan')).toBeTruthy();
  });

  it('uses default prefs when getNotificationPreferences fails', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockRejectedValue(new Error('fail'));
    render(<NotificationPreferences onBack={vi.fn()} />);
    expect(await screen.findByText('Push Notification')).toBeTruthy();
    const input = screen.getByDisplayValue('22:00');
    expect(input).toBeTruthy();
  });

  it('updates quiet hours time inputs', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByDisplayValue('22:00');
    const startInput = screen.getByLabelText('Mulai');
    fireEvent.change(startInput, { target: { value: '23:00' } });
    expect(startInput.value).toBe('23:00');
  });

  it('changes language via select', async () => {
    vi.spyOn(papi, 'getNotificationPreferences').mockResolvedValue({ ...DEFAULT_PREFS });
    render(<NotificationPreferences onBack={vi.fn()} />);
    await screen.findByText('Push Notification');
    const langSelect = screen.getByDisplayValue('Bahasa Indonesia');
    fireEvent.change(langSelect, { target: { value: 'en' } });
    expect(langSelect.value).toBe('en');
  });
});
