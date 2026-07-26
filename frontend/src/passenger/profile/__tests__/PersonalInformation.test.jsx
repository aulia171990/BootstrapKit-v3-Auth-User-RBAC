import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInformation from '../PersonalInformation.jsx';
import * as papi from '../../api.js';

const mockUser = { name: 'Budi', email: 'b@t.es', phone: '62812' };
const memberSince = '2024-01-01';

afterEach(() => { vi.restoreAllMocks(); });

describe('PersonalInformation', () => {
  it('renders loading skeleton initially', () => {
    vi.spyOn(papi, 'getProfile').mockImplementation(() => new Promise(() => {}));
    const { container } = render(<PersonalInformation user={mockUser} onBack={() => {}} />);
    expect(container.querySelector('.pasv-pro__skeleton')).toBeTruthy();
  });

  it('renders user data after loading', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi Santoso', email: 'budi@ojol.test', phone: '62812345678', birthDate: '1990-01-15', gender: 'male', avatar: null, verified: true, memberSince });
    render(<PersonalInformation user={mockUser} onBack={() => {}} />);
    expect(await screen.findByText('Data Diri')).toBeTruthy();
    expect(screen.getAllByText('Budi Santoso').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Terverifikasi')).toBeTruthy();
  });

  it('shows edit button and toggles edit mode', async () => {
    vi.spyOn(papi, 'getProfile').mockResolvedValue({ name: 'Budi', email: 'b@t.es', phone: '62812', birthDate: '1990-01-15', gender: 'male', avatar: null, verified: true, memberSince });
    render(<PersonalInformation user={mockUser} onBack={() => {}} />);
    expect(await screen.findByLabelText('Edit')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(screen.getByText('Simpan')).toBeTruthy();
    expect(screen.getByText('Batal')).toBeTruthy();
  });

  it('shows error state on API failure', async () => {
    vi.spyOn(papi, 'getProfile').mockRejectedValue(new Error('Network error'));
    render(<PersonalInformation user={mockUser} onBack={() => {}} />);
    expect(await screen.findByText('Gagal memuat data')).toBeTruthy();
  });
});
