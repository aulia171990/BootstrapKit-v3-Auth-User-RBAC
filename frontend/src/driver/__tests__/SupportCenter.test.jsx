import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SupportCenter from '../pages/SupportCenter.jsx';

describe('SupportCenter', () => {
  it('renders page title', () => {
    render(<SupportCenter onBack={vi.fn()} />);
    expect(screen.getAllByText('Pusat Bantuan').length).toBeGreaterThanOrEqual(1);
  });

  it('renders contact options', () => {
    render(<SupportCenter onBack={vi.fn()} />);
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Telepon')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<SupportCenter onBack={vi.fn()} />);
    expect(screen.getByText('Pertanyaan Umum (FAQ)')).toBeInTheDocument();
    expect(screen.getByText('Bagaimana cara menerima pesanan?')).toBeInTheDocument();
  });

  it('toggles FAQ answer on click', () => {
    render(<SupportCenter onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('Bagaimana cara menerima pesanan?'));
    expect(screen.getByText(/Pastikan status Anda Online/)).toBeInTheDocument();
  });

  it('renders help CTA', () => {
    render(<SupportCenter onBack={vi.fn()} />);
    expect(screen.getByText('Butuh bantuan lebih lanjut?')).toBeInTheDocument();
    expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
  });
});
