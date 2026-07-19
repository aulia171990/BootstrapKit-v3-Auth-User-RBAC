import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChatScreen from '../ChatScreen.jsx';

const driver = { id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg' };
const booking = { id: 'bk-chat' };

afterEach(() => { vi.useRealTimers(); });

describe('ChatScreen (3C-3E)', () => {
  it('renders the seeded conversation and driver header', () => {
    render(<ChatScreen booking={booking} driver={driver} onClose={vi.fn()} />);
    expect(screen.getByText(/Halo, saya Anto/)).toBeInTheDocument();
    expect(screen.getByText('Anto')).toBeInTheDocument();
  });

  it('sends a typed message and shows message status', async () => {
    vi.useFakeTimers();
    render(<ChatScreen booking={booking} driver={driver} onClose={vi.fn()} />);
    const input = screen.getByLabelText('Tulis pesan');
    fireEvent.change(input, { target: { value: 'Di mana Anda?' } });
    fireEvent.click(screen.getByLabelText('Kirim'));
    expect(screen.getByText('Di mana Anda?')).toBeInTheDocument();
    // meta shows a timestamp (id-ID locale uses ':' or '.')
    expect(screen.getAllByText(/^\d{2}[:.]\d{2}$/).length).toBeGreaterThan(0);
    await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
  });

  it('sends a quick reply and receives a driver reply', async () => {
    render(<ChatScreen booking={booking} driver={driver} onClose={vi.fn()} />);
    // find the chip (async quick replies) BEFORE enabling fake timers
    const chip = await screen.findByText('Terima kasih');
    vi.useFakeTimers();
    fireEvent.click(chip);
    await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
    expect(screen.getByText(/Oke, terima kasih/)).toBeInTheDocument();
  });

  it('shows typing then a driver reply after sending', async () => {
    vi.useFakeTimers();
    render(<ChatScreen booking={booking} driver={driver} onClose={vi.fn()} />);
    const input = screen.getByLabelText('Tulis pesan');
    fireEvent.change(input, { target: { value: 'saya sudah di titik jemput' } });
    fireEvent.click(screen.getByLabelText('Kirim'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(screen.getByText(/Baik, saya menuju/)).toBeInTheDocument();
  });
});
