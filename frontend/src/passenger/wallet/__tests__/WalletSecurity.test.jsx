import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletSecurity from '../WalletSecurity.jsx';
import * as papi from '../../api.js';

const noop = () => {};

describe('WalletSecurity (4F)', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('shows unlock gate (PIN) on load', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    render(<WalletSecurity onBack={noop} />);
    expect(await screen.findByText('Kunci Dompet')).toBeTruthy();
    expect(screen.getByLabelText('Masukkan PIN 6 digit')).toBeTruthy();
  });

  it('shows biometric unlock when supported', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: true, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    render(<WalletSecurity onBack={noop} />);
    expect(await screen.findByRole('button', { name: /Buka dengan Biometrik/ })).toBeTruthy();
  });

  it('unlocks with correct PIN (123456) and shows dashboard', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockResolvedValue({ ok: true });
    render(<WalletSecurity onBack={noop} />);
    const input = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    expect(await screen.findByText('Status Keamanan')).toBeTruthy();
    expect(screen.getByText('Tips Keamanan')).toBeTruthy();
  });

  it('rejects wrong PIN', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockRejectedValue(new Error('PIN salah'));
    render(<WalletSecurity onBack={noop} />);
    const input = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(input, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    expect(await screen.findByText('PIN salah')).toBeTruthy();
  });

  it('toggles sensitive-data masking', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockResolvedValue({ ok: true });
    render(<WalletSecurity onBack={noop} />);
    const input = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    const toggle = await screen.findByRole('switch', { name: 'Sembunyikan data sensitif' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    expect(await screen.findByRole('switch', { name: 'Sembunyikan data sensitif' })).toHaveAttribute('aria-checked', 'false');
  });

  it('changes session timeout', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockResolvedValue({ ok: true });
    const spy = vi.spyOn(papi, 'updateSessionTimeout').mockResolvedValue({ sessionTimeoutMin: 15 });
    render(<WalletSecurity onBack={noop} />);
    const input = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    fireEvent.click(await screen.findByRole('radio', { name: '15 mnt' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(15));
  });

  it('shows device verification status', async () => {
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    vi.spyOn(papi, 'verifyPin').mockResolvedValue({ ok: true });
    render(<WalletSecurity onBack={noop} />);
    const input = await screen.findByLabelText('Masukkan PIN 6 digit');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buka dengan PIN' }));
    expect(await screen.findByText('Verifikasi Perangkat')).toBeTruthy();
    expect(screen.getByText('Terverifikasi')).toBeTruthy();
  });

  it('navigates back (onBack called)', async () => {
    const onBack = vi.fn();
    vi.spyOn(papi, 'getSecurityStatus').mockResolvedValue({ biometricSupported: false, pinSet: true, sessionTimeoutMin: 5, deviceVerified: true, lastSession: new Date().toISOString(), signedIn: true });
    render(<WalletSecurity onBack={onBack} />);
    fireEvent.click(await screen.findByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });
});
