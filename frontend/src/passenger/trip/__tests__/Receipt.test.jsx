import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Receipt from '../Receipt.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const a = await vi.importActual('../../api.js');
  return { ...a, getTripSummary: vi.fn(), shareTrip: vi.fn() };
});

const driver = { id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg', vehicle: 'Honda Vario', plate: 'B 1234 ANT' };
const booking = { id: 'BKR1' };

beforeEach(() => {
  papi.getTripSummary.mockResolvedValue({
    bookingId: 'BKR1', fare: 38500, currency: 'IDR', distanceKm: 8.4, durationMin: 22,
    paymentStatus: 'paid', paymentMethod: 'Wallet', vehicle: 'Mobil', rating: null,
    promo: { code: 'JALAN15', title: 'Diskon perjalanan', amount: 15000, tone: 'success' },
    invoiceNo: 'INV-BKR1-2026', issuedAt: new Date('2026-07-19T10:00:00').toISOString(),
  });
  papi.shareTrip.mockResolvedValue({ id: 'BKR1', url: 'https://ojol.test/t/rcpt' });
  // jsdom lacks object URL + anchor download; stub minimally (override setup stub).
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

describe('Receipt (3C-3H)', () => {
  it('shows invoice, trip summary, payment detail, promo', async () => {
    render(<Receipt booking={booking} driver={driver} onHome={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('INV-BKR1-2026')).toBeInTheDocument());
    expect(screen.getByText('Trip Summary')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('8.4 km')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('22 mnt')).toBeInTheDocument());
    expect(screen.getByText('Payment Detail')).toBeInTheDocument();
    expect(screen.getByText('Promo Detail')).toBeInTheDocument();
    expect(screen.getByText('JALAN15')).toBeInTheDocument();
  });

  it('downloads the receipt', async () => {
    const onDownload = vi.fn();
    render(<Receipt booking={booking} driver={driver} onDownload={onDownload} onHome={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('INV-BKR1-2026')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Download'));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
  });

  it('shares and repeats', async () => {
    const onShare = vi.fn();
    const onRepeat = vi.fn();
    render(<Receipt booking={booking} driver={driver} onShare={onShare} onRepeat={onRepeat} onHome={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('INV-BKR1-2026')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Share'));
    await waitFor(() => expect(papi.shareTrip).toHaveBeenCalledWith('BKR1'));
    await waitFor(() => expect(screen.getByText(/ojol\.test\/t\//)).toBeInTheDocument());
    expect(onShare).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Pesan Lagi/));
    expect(onRepeat).toHaveBeenCalledWith(booking, driver);
  });
});
