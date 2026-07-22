import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RefundSupport from '../RefundSupport.jsx';
import * as papi from '../../api.js';

describe('RefundSupport — component', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('shows refund status and ticket status', async () => {
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([
      { id: 'rf1', tripId: 't1', amount: 14000, currency: 'IDR', status: 'completed', reason: 'Dibatalkan driver', createdAt: new Date().toISOString(), method: 'Wallet' },
    ]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([
      { id: 'tk1', tripId: 't1', category: 'payment', subject: 'Tarif salah', status: 'open', createdAt: new Date().toISOString() },
    ]);
    render(<RefundSupport trip={{ id: 't1' }} />);
    expect(await screen.findByText('Dibatalkan driver')).toBeTruthy();
    expect(screen.getByText('Tarif salah')).toBeTruthy();
    expect(screen.getByText('Selesai')).toBeTruthy(); // refund completed
    expect(screen.getByText('Dibuka')).toBeTruthy(); // ticket open
  });

  it('opens refund detail dialog', async () => {
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([
      { id: 'rf1', tripId: 't1', amount: 14000, currency: 'IDR', status: 'completed', reason: 'Dibatalkan driver', createdAt: new Date().toISOString(), method: 'Wallet' },
    ]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    render(<RefundSupport trip={{ id: 't1' }} />);
    fireEvent.click(await screen.findByRole('button', { name: /Detail refund/ }));
    expect(await screen.findByText('Detail Refund')).toBeTruthy();
    expect(screen.getByText('Dana sudah kembali')).toBeTruthy();
  });

  it('shows empty states when none', async () => {
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    render(<RefundSupport trip={{ id: 't1' }} />);
    expect(await screen.findByText('Belum ada refund untuk perjalanan ini.')).toBeTruthy();
    expect(screen.getByText('Belum ada tiket bantuan.')).toBeTruthy();
  });

  it('shows error state', async () => {
    vi.spyOn(papi, 'getRefunds').mockRejectedValue(new Error('boom'));
    vi.spyOn(papi, 'getSupportTickets').mockRejectedValue(new Error('boom'));
    render(<RefundSupport trip={{ id: 't1' }} />);
    expect(await screen.findByText('Gagal memuat')).toBeTruthy();
  });
});

describe('RefundSupport — actions', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('submits a report (creates a support ticket)', async () => {
    const create = vi.spyOn(papi, 'getRefunds').mockResolvedValue([]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    const createTicket = vi.spyOn(papi, 'createSupportTicket').mockResolvedValue({ id: 'tk9', status: 'open' });
    render(<RefundSupport trip={{ id: 't1' }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Laporkan Masalah' }));
    const dialog = await screen.findByRole('dialog', { name: 'Laporkan Masalah' });
    fireEvent.change(within(dialog).getByLabelText('Subjek'), { target: { value: 'Tarif salah' } });
    fireEvent.change(within(dialog).getByLabelText('Detail'), { target: { value: 'Detail masalah' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Kirim/ }));
    await waitFor(() => expect(createTicket).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Tarif salah', message: 'Detail masalah' })));
  });

  it('opens contact support (chat)', async () => {
    const onContactSupport = vi.fn();
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    render(<RefundSupport trip={{ id: 't1' }} onContactSupport={onContactSupport} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Hubungi CS' }));
    expect(onContactSupport).toHaveBeenCalled();
  });

  it('opens trip dispute', async () => {
    const onDispute = vi.fn();
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    render(<RefundSupport trip={{ id: 't1' }} onDispute={onDispute} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Sengketa Trip' }));
    expect(onDispute).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('navigates back', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getRefunds').mockResolvedValue([]);
    vi.spyOn(papi, 'getSupportTickets').mockResolvedValue([]);
    render(<RefundSupport trip={{ id: 't1' }} onBack={onBack} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Kembali' }));
    expect(onBack).toHaveBeenCalled();
  });
});
