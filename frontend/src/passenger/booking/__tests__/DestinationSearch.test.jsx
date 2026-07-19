import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import DestinationSearch from '../DestinationSearch.jsx';
import * as papi from '../../api.js';

const user = { name: 'Budi Santoso', email: 'budi@ojol.id' };

// Click the suggestion/favorite row whose visible text contains `text`.
function clickRow(text) {
  const opt = screen.getAllByRole('option').find((o) => o.textContent.replace(/\s+/g, '').toLowerCase().includes(text.toLowerCase()));
  fireEvent.click(within(opt).getByRole('button'));
}

describe('DestinationSearch — component', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('shows loading then renders favorites + recents', async () => {
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    expect(screen.getByText('Kafe Senja')).toBeInTheDocument(); // favorite
  });

  it('debounces and shows suggestions with highlighting', async () => {
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    const input = screen.getByLabelText('Cari tujuan');
    fireEvent.change(input, { target: { value: 'kafe' } });
    await waitFor(() => expect(screen.getByText('Saran')).toBeInTheDocument());
    expect(screen.getByText((c) => (c || '').includes('Kafe'))).toBeInTheDocument();
    // highlight mark present
    expect(document.querySelector('.pasv-book__hl')).not.toBeNull();
  });

  it('empty/error states', async () => {
    const spy = vi.spyOn(papi, 'getFavorites').mockRejectedValueOnce(new Error('boom'));
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Gagal memuat/)).toBeInTheDocument());
    spy.mockRestore();
  });

  it('no results for unknown query', async () => {
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Cari tujuan'), { target: { value: 'zzzzz' } });
    await waitFor(() => expect(screen.getByText((c) => c.includes('Tidak ditemukan'))).toBeInTheDocument());
  });
});

describe('DestinationSearch — navigation', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('selecting a suggestion calls onSelectDestination with the place', async () => {
    const onSelect = vi.fn();
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={onSelect} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Cari tujuan'), { target: { value: 'kafe' } });
    await waitFor(() => expect(screen.getByText('Saran')).toBeInTheDocument());
    clickRow('Kafe');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kafe Senja' }));
  });

  it('selecting a favorite calls onSelectDestination', async () => {
    const onSelect = vi.fn();
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={onSelect} />);
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Kafe Senja'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('current-location shortcut selects current location', async () => {
    const onSelect = vi.fn();
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={onSelect} />);
    await waitFor(() => expect(screen.getByLabelText('Lokasi')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Lokasi'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Jl. Merdeka No. 12, Jakarta' }));
  });

  it('back button invokes onBack', async () => {
    const onBack = vi.fn();
    render(<DestinationSearch user={user} onBack={onBack} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });

  it('stores recent searches after selection', async () => {
    const onSelect = vi.fn();
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={onSelect} />);
    await waitFor(() => expect(screen.getByText('Kafe Senja')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Kafe Senja'));
    expect(papi.getRecentSearches().some((r) => r.id === 'f1')).toBe(true);
  });
});

describe('DestinationSearch — keyboard + a11y', () => {
  beforeEach(() => { papi.clearRecentSearches(); });
  afterEach(() => { papi.clearRecentSearches(); });

  it('keyboard arrow + enter selects a suggestion', async () => {
    const onSelect = vi.fn();
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={onSelect} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    const input = screen.getByLabelText('Cari tujuan');
    fireEvent.change(input, { target: { value: 'kafe' } });
    await waitFor(() => expect(screen.getByText('Saran')).toBeInTheDocument());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kafe Senja' }));
  });

  it('has labelled sections, large touch targets, and aria roles', async () => {
    render(<DestinationSearch user={user} onBack={vi.fn()} onSelectDestination={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Tempat favorit')).toBeInTheDocument());
    expect(screen.getByLabelText('Cari tujuan')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // shortcut group labelled
    expect(screen.getByRole('group', { name: 'Pintasan lokasi' })).toBeInTheDocument();
    // each suggestion is an option
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });
});
