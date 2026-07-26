import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RatingsPage from '../pages/RatingsPage.jsx';

describe('RatingsPage', () => {
  it('renders page title', () => {
    render(<RatingsPage onBack={vi.fn()} />);
    expect(screen.getByText('Rating & Ulasan')).toBeInTheDocument();
  });

  it('renders rating score', () => {
    render(<RatingsPage stats={{ rating: 4.9, total_reviews: 128 }} onBack={vi.fn()} />);
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('128 ulasan')).toBeInTheDocument();
  });

  it('renders category scores', () => {
    render(<RatingsPage onBack={vi.fn()} />);
    expect(screen.getByText('Pelayanan')).toBeInTheDocument();
    expect(screen.getByText('Ketepatan Waktu')).toBeInTheDocument();
    expect(screen.getByText('Kebersihan Kendaraan')).toBeInTheDocument();
    expect(screen.getByText('Keamanan Berkendara')).toBeInTheDocument();
  });

  it('renders recent reviews', () => {
    render(<RatingsPage onBack={vi.fn()} />);
    expect(screen.getByText('Ulasan Terbaru')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('Siti')).toBeInTheDocument();
  });
});
