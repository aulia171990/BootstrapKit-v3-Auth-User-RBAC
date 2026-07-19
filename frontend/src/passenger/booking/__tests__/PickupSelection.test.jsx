import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PickupSelection from '../PickupSelection.jsx';
import * as papi from '../../api.js';

const dest = { id: 'pl3', title: 'Bandara Soekarno-Hatta T2', subtitle: 'Tangerang' };

describe('PickupSelection — component', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('loads map + current location + saved pickups', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Pilih Titik Jemput')).toBeInTheDocument());
    expect(screen.getByLabelText(/Peta titik jemput/)).toBeInTheDocument();
    expect(screen.getByText('Tempat tersimpan')).toBeInTheDocument();
    expect(screen.getByText('Kafe Senja')).toBeInTheDocument(); // saved
  });

  it('error state with retry', async () => {
    const spy = vi.spyOn(papi, 'getCurrentLocation').mockRejectedValueOnce(new Error('boom'));
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat/)).toBeInTheDocument());
    spy.mockRestore();
  });

  it('search pickup shows suggestions', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Cari titik jemput'), { target: { value: 'kafe' } });
    const results = await screen.findByRole('list', { name: 'Hasil pencarian' });
    expect(within(results).getByText((c) => (c || '').includes('Kafe'))).toBeInTheDocument();
  });

  it('no suggestions for unknown query', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Cari titik jemput'), { target: { value: 'zzzzz' } });
    // suggestions list absent
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('PickupSelection — navigation & interaction', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('current location button sets address', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Gunakan lokasi saat ini')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Gunakan lokasi saat ini'));
    expect(screen.getByText((c) => (c || '').includes('Jl. Merdeka'))).toBeInTheDocument();
  });

  it('saved pickup selection sets address', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeInTheDocument());
    const saved = screen.getByRole('region', { name: 'Tempat tersimpan' });
    fireEvent.click(within(saved).getByText('Kafe Senja'));
    expect(document.querySelector('.pasv-pickup__confirm-addr').textContent).toContain('Kafe Senja');
  });

  it('confirm pickup calls onConfirmPickup with address + coord', async () => {
    const onConfirm = vi.fn();
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={onConfirm} />);
    await waitFor(() => expect(screen.getByText('Konfirmasi')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Konfirmasi'));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ address: expect.any(String), coord: expect.objectContaining({ lat: expect.any(Number), lng: expect.any(Number) }), destination: dest }));
  });

  it('back button invokes onBack', async () => {
    const onBack = vi.fn();
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={onBack} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Kembali')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });

  it('dragging map updates coordinate badge', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/Peta titik jemput/)).toBeInTheDocument());
    const map = screen.getByLabelText(/Peta titik jemput/);
    const before = document.querySelector('.pasv-pickup__coords').textContent;
    fireEvent.pointerDown(map, { clientX: 100, clientY: 100, pointerId: 1 });
    // jsdom drops clientX on pointer init; dispatch a real MouseEvent so the handler receives coords.
    fireEvent(map, new window.MouseEvent('pointermove', { clientX: 140, clientY: 60, bubbles: true }));
    fireEvent.pointerUp(map, { clientX: 140, clientY: 60, pointerId: 1 });
    const after = document.querySelector('.pasv-pickup__coords').textContent;
    expect(after).not.toBe(before); // drag changed the coordinate
  });
});

describe('PickupSelection — accessibility', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('has labelled search, map, and confirm button', async () => {
    render(<PickupSelection destination={dest} user={{ name: 'Budi' }} onBack={vi.fn()} onConfirmPickup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Konfirmasi')).toBeInTheDocument());
    expect(screen.getByLabelText('Cari titik jemput')).toBeInTheDocument();
    expect(screen.getByLabelText(/Peta titik jemput/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Konfirmasi' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Pintasan titik jemput' })).toBeInTheDocument();
  });
});
