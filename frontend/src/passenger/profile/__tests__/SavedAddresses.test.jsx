import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SavedAddresses from '../SavedAddresses.jsx';
import * as papi from '../../api.js';

afterEach(() => { vi.restoreAllMocks(); });

describe('SavedAddresses', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(papi, 'getSavedAddresses').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<SavedAddresses onBack={() => {}} />);
    expect(container.querySelector('.pasv-pro__skeleton')).toBeTruthy();
  });

  it('renders address list after loading', async () => {
    vi.spyOn(papi, 'getSavedAddresses').mockResolvedValue([
      { id: '1', label: 'Rumah', address: 'Jl. Mawar No. 1', icon: 'home', isDefault: true },
      { id: '2', label: 'Kantor', address: 'Jl. Sudirman No. 10', icon: 'building', isDefault: false },
    ]);
    render(<SavedAddresses onBack={() => {}} />);
    expect(await screen.findByText('Alamat Tersimpan')).toBeTruthy();
    expect(screen.getByText('Rumah')).toBeTruthy();
    expect(screen.getByText('Kantor')).toBeTruthy();
    expect(screen.getByText('Jl. Mawar No. 1')).toBeTruthy();
  });

  it('shows empty state when no addresses', async () => {
    vi.spyOn(papi, 'getSavedAddresses').mockResolvedValue([]);
    render(<SavedAddresses onBack={() => {}} />);
    expect(await screen.findByText('Belum ada alamat')).toBeTruthy();
  });

  it('shows add address button in empty state', async () => {
    vi.spyOn(papi, 'getSavedAddresses').mockResolvedValue([]);
    render(<SavedAddresses onBack={() => {}} />);
    expect(await screen.findByText('Belum ada alamat')).toBeTruthy();
    expect(screen.getByText('Tambah Alamat')).toBeTruthy();
  });

  it('shows error state on API failure', async () => {
    vi.spyOn(papi, 'getSavedAddresses').mockRejectedValue(new Error('Network error'));
    render(<SavedAddresses onBack={() => {}} />);
    expect(await screen.findByText('Gagal memuat')).toBeTruthy();
  });
});
