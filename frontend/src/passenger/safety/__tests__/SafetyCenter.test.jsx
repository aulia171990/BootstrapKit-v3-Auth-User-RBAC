import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SafetyCenter from '../SafetyCenter.jsx';
import * as papi from '../../api.js';

vi.mock('../../api.js', async () => {
  const a = await vi.importActual('../../api.js');
  return {
    ...a,
    getEmergencyContacts: vi.fn(),
    getVerificationCode: vi.fn(),
    triggerSos: vi.fn(),
    shareTrip: vi.fn(),
  };
});

const driver = { id: 'dr1', name: 'Anto', photo: 'https://example.com/anto.jpg' };
const booking = { id: 'BKS1' };

beforeEach(() => {
  papi.getEmergencyContacts.mockResolvedValue([
    { id: 'ec1', name: 'Ibu', phone: '+62811111111', relation: 'Keluarga' },
  ]);
  papi.getVerificationCode.mockResolvedValue({ bookingId: 'BKS1', code: '4321' });
  papi.triggerSos.mockResolvedValue({ id: 'sos-1', status: 'dispatched' });
  papi.shareTrip.mockResolvedValue({ id: 'BKS1', url: 'https://ojol.test/t/xyz' });
});

describe('SafetyCenter (3C-3F)', () => {
  it('renders SOS, verification code, contacts, tips, emergency call', async () => {
    render(<SafetyCenter booking={booking} driver={driver} onClose={vi.fn()} />);
    expect(screen.getByLabelText('Kirim SOS')).toBeInTheDocument();
    expect(screen.getByText('Panggilan Darurat')).toBeInTheDocument();
    expect(screen.getByText('Kode Verifikasi Perjalanan')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('4321')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Ibu')).toBeInTheDocument());
    expect(screen.getByText(/Tips Keamanan/)).toBeInTheDocument();
  });

  it('opens SOS confirmation dialog and dispatches SOS on confirm', async () => {
    const onSos = vi.fn();
    render(<SafetyCenter booking={booking} driver={driver} onClose={vi.fn()} onSos={onSos} />);
    fireEvent.click(screen.getByLabelText('Kirim SOS'));
    expect(screen.getByText('Kirim SOS?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ya, Kirim SOS'));
    await waitFor(() => expect(papi.triggerSos).toHaveBeenCalledWith('BKS1', { driverId: 'dr1' }));
    await waitFor(() => expect(screen.getByText(/SOS terkirim/)).toBeInTheDocument());
    expect(onSos).toHaveBeenCalled();
  });

  it('shares live trip and shows the link', async () => {
    render(<SafetyCenter booking={booking} driver={driver} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Bagikan sekarang'));
    await waitFor(() => expect(papi.shareTrip).toHaveBeenCalledWith('BKS1'));
    await waitFor(() => expect(screen.getByText(/ojol\.test\/t\//)).toBeInTheDocument());
  });
});
