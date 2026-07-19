import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import VoiceCall from '../VoiceCall.jsx';

const driver = { id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg' };

afterEach(() => { vi.useRealTimers(); });

describe('VoiceCall (3C-3E)', () => {
  it('shows calling then connects with a timer, and ends on Hang up', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<VoiceCall booking={{ id: 'bk-call' }} driver={driver} onClose={onClose} />);
    expect(screen.getByText('Memanggil…')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(2100); });
    expect(screen.getByText('00:00')).toBeInTheDocument();
    const mute = screen.getByLabelText(/Bisukan mikrofon/);
    fireEvent.click(mute);
    expect(mute).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByLabelText('Akhiri panggilan'));
    expect(screen.getByText('Panggilan diakhiri')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    expect(onClose).toHaveBeenCalled();
  });
});
