import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SecurityCenter from '../SecurityCenter.jsx';
import * as papi from '../../api.js';

const noop = () => {};

afterEach(() => { vi.restoreAllMocks(); });

describe('SecurityCenter', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(papi, 'getProfile').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(papi, 'getLoginHistory').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(papi, 'getTrustedDevices').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<SecurityCenter onBack={noop} />);
    expect(container.querySelector('.pasv-pro__skeleton')).toBeTruthy();
  });

  it('renders security sections after loading', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', verified: true });
    vi.spyOn(papi, 'getLoginHistory').mockResolvedValue([{ id: '1', device: 'Chrome', location: 'Jakarta', ip: '192.168.1.1', time: '2024-01-01T00:00:00Z', current: false }]);
    vi.spyOn(papi, 'getTrustedDevices').mockResolvedValue([{ id: 'd1', name: 'Pixel 7', os: 'Android 15', lastUsed: '2024-01-01T00:00:00Z', current: false }]);
    render(<SecurityCenter onBack={noop} />);
    expect(await screen.findByText('Kata Sandi & PIN')).toBeTruthy();
    expect(screen.getByText('Ubah Password')).toBeTruthy();
    expect(screen.getByText('Autentikasi Dua Faktor')).toBeTruthy();
    expect(screen.getByText('Perangkat Dipercaya')).toBeTruthy();
  });

  it('shows error state on failure', async () => {
    vi.spyOn(papi, 'getProfile').mockRejectedValue(new Error('Network error'));
    render(<SecurityCenter onBack={noop} />);
    expect(await screen.findByText('Gagal memuat')).toBeTruthy();
  });
});
