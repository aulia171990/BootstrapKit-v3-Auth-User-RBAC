import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SafetyPage from '../pages/SafetyPage.jsx';
import { driverAPI } from '../driver-api.js';

vi.mock('../driver-api.js', () => ({
  driverAPI: {
    emergencyContacts: vi.fn(),
    sosTrigger: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  driverAPI.emergencyContacts.mockResolvedValue([
    { id: 'ec1', name: 'Ibu', phone: '+6281111111111', relation: 'Keluarga' },
  ]);
});

describe('SafetyPage', () => {
  it('renders page title', async () => {
    render(<SafetyPage onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Keselamatan')).toBeInTheDocument());
  });

  it('shows SOS button', async () => {
    render(<SafetyPage onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('SOS')).toBeInTheDocument());
  });

  it('shows emergency contacts', async () => {
    render(<SafetyPage onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Ibu')).toBeInTheDocument());
  });
});
