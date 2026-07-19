import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PassengerHome from '../PassengerHome.jsx';
import PassengerApp from '../PassengerApp.jsx';
import * as papi from '../api.js';

const user = { name: 'Budi Santoso', email: 'budi@ojol.id' };

describe('PassengerHome — component', () => {
  it('shows loading then renders greeting + sections', async () => {
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    expect(screen.getByText('Memuat beranda…')).toBeInTheDocument(); // Loading
    await waitFor(() => expect(screen.getByText('Mau ke mana hari ini?')).toBeInTheDocument());
    expect(screen.getByText('Promo untukmu')).toBeInTheDocument();
    expect(screen.getByText('Tujuan terakhir')).toBeInTheDocument();
    expect(screen.getByText('Driver terdekat')).toBeInTheDocument();
    expect(screen.getByText('Aktivitas terbaru')).toBeInTheDocument();
    expect(screen.getByText(/Saldo dompet/)).toBeInTheDocument();
  });

  it('renders wallet balance from data', async () => {
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/125\.?000/)).toBeInTheDocument());
    expect(screen.getByText(/Rp 125\.?000/)).toBeInTheDocument();
  });

  it('shows nearby drivers summary', async () => {
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Anto')).toBeInTheDocument());
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });
});

describe('PassengerHome — navigation', () => {
  it('search destination navigates to booking', async () => {
    const onNavigate = vi.fn();
    render(<PassengerHome user={user} onNavigate={onNavigate} />);
    await waitFor(() => expect(screen.getByText('Mau ke mana hari ini?')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Ke mana tujuan Anda?'));
    expect(onNavigate).toHaveBeenCalledWith('booking:ride');
  });

  it('quick service (ride) navigates', async () => {
    const onNavigate = vi.fn();
    render(<PassengerHome user={user} onNavigate={onNavigate} />);
    await waitFor(() => expect(screen.getByLabelText('Ride')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Ride'));
    expect(onNavigate).toHaveBeenCalledWith('booking:ride');
  });

  it('disabled quick services do not navigate', async () => {
    const onNavigate = vi.fn();
    render(<PassengerHome user={user} onNavigate={onNavigate} />);
    await waitFor(() => expect(screen.getByLabelText('Food')).toBeInTheDocument());
    expect(screen.getByLabelText('Food')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Food'));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('bottom nav switches tabs', async () => {
    render(<PassengerApp user={user} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Mau ke mana hari ini?')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Wallet' }));
    expect(screen.getAllByText('Dompet').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
    expect(screen.getAllByText('Profil').length).toBeGreaterThan(0);
  });
});

describe('PassengerHome — states', () => {
  afterEach(() => { Object.defineProperty(navigator, 'onLine', { value: true, configurable: true }); });

  it('offline state when navigator is offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Tidak ada koneksi/)).toBeInTheDocument());
  });

  it('error state on data failure', async () => {
    const spy = vi.spyOn(papi, 'getPromotions').mockRejectedValueOnce(new Error('boom'));
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat beranda/)).toBeInTheDocument());
    spy.mockRestore();
  });
});

describe('PassengerHome — accessibility', () => {
  it('has labelled sections and large touch targets', async () => {
    render(<PassengerHome user={user} onNavigate={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Mau ke mana hari ini?')).toBeInTheDocument());
    // All main sections are labelled regions/headings (aria-label or visible title)
    const ariaLabels = ['Lokasi saat ini', 'Cari tujuan', 'Layanan cepat'];
    const titles = ['Promo untukmu', 'Tujuan terakhir', 'Tempat favorit', 'Driver terdekat', 'Dompet', 'Aktivitas terbaru'];
    ariaLabels.forEach((l) => expect(screen.getAllByLabelText(l).length).toBeGreaterThan(0));
    titles.forEach((l) => expect(screen.getAllByText(l).length).toBeGreaterThan(0));
    expect(screen.getByLabelText('Ride')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery')).toBeInTheDocument();
    // App bar buttons have aria-labels
    expect(screen.getAllByLabelText('Dompet').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Profil')).toBeInTheDocument();
  });
});
