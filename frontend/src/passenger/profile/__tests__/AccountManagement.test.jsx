import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountManagement from '../AccountManagement.jsx';
import * as papi from '../../api.js';

const noop = () => {};

afterEach(() => { vi.restoreAllMocks(); });

describe('AccountManagement', () => {
  it('renders account sections', () => {
    render(<AccountManagement onBack={noop} onLogout={noop} />);
    expect(screen.getByText('Akun')).toBeTruthy();
    expect(screen.getByText('Legal')).toBeTruthy();
    expect(screen.getByText('Informasi')).toBeTruthy();
  });

  it('renders action items', () => {
    render(<AccountManagement onBack={noop} onLogout={noop} />);
    expect(screen.getAllByText('Logout Semua Perangkat').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Nonaktifkan Akun')).toBeTruthy();
    expect(screen.getByText('Hapus Akun')).toBeTruthy();
    expect(screen.getByText('Kebijakan Privasi')).toBeTruthy();
    expect(screen.getByText('Tentang Aplikasi')).toBeTruthy();
  });

  it('shows version info', () => {
    render(<AccountManagement onBack={noop} onLogout={noop} />);
    expect(screen.getAllByText('Versi 3.2.1 (Build 42)').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn();
    render(<AccountManagement onBack={onBack} onLogout={noop} />);
    fireEvent.click(screen.getByLabelText('Kembali'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders logout button for current device', () => {
    render(<AccountManagement onBack={noop} onLogout={noop} />);
    expect(screen.getByText('Keluar (Perangkat Ini)')).toBeTruthy();
  });
});
