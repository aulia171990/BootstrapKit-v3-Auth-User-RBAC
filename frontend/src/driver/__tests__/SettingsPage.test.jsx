import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '../pages/SettingsPage.jsx';

describe('SettingsPage', () => {
  it('renders page title', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
  });

  it('renders notification section', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    expect(screen.getByText('Suara Notifikasi')).toBeInTheDocument();
  });

  it('renders navigation section', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Navigasi')).toBeInTheDocument();
    expect(screen.getByText('Aplikasi Navigasi')).toBeInTheDocument();
  });

  it('renders trip settings', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Terima Pesanan Otomatis')).toBeInTheDocument();
  });

  it('toggles sound setting on click', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    const toggles = document.querySelectorAll('.drv-toggle');
    expect(toggles.length).toBeGreaterThan(0);
    fireEvent.click(toggles[0]);
    expect(toggles[0].classList.contains('drv-toggle--active')).toBe(false);
  });

  it('renders logout button', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('renders app version', () => {
    render(<SettingsPage onBack={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Versi 1.0.0')).toBeInTheDocument();
  });
});
