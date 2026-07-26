import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Documents from '../pages/Documents.jsx';

const mockDocs = {
  ktp: { status: 'verified', url: '#' },
  sim: { status: 'verified', url: '#' },
  stnk: { status: 'pending', url: '#' },
  vehicle_photo: { status: 'rejected', url: '#' },
  selfie: { status: 'verified', url: '#' },
};

describe('Documents', () => {
  it('renders document list', () => {
    render(<Documents documents={mockDocs} onBack={vi.fn()} />);
    expect(screen.getByText('KTP')).toBeInTheDocument();
    expect(screen.getByText('SIM')).toBeInTheDocument();
    expect(screen.getByText('STNK')).toBeInTheDocument();
    expect(screen.getByText('Foto Kendaraan')).toBeInTheDocument();
    expect(screen.getByText('Selfie + KTP')).toBeInTheDocument();
  });

  it('shows verified status for verified docs', () => {
    render(<Documents documents={mockDocs} onBack={vi.fn()} />);
    expect(screen.getAllByText('Terverifikasi').length).toBe(3);
  });

  it('shows upload button for rejected docs', () => {
    render(<Documents documents={mockDocs} onBack={vi.fn()} />);
    expect(screen.getByText('Upload Ulang')).toBeInTheDocument();
  });

  it('calls onUpload when upload clicked', async () => {
    const onUpload = vi.fn();
    render(<Documents documents={{}} onBack={vi.fn()} onUpload={onUpload} />);
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    await waitFor(() => expect(onUpload).toHaveBeenCalled());
  });
});
