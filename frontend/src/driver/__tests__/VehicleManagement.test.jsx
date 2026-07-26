import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleManagement from '../pages/VehicleManagement.jsx';

const mockVehicle = {
  plate: 'B 1234 ABC',
  type: 'motor',
  model: 'Honda Vario',
  color: 'Hitam',
  year: '2021',
  brand: 'Honda',
};

describe('VehicleManagement', () => {
  it('renders vehicle details', () => {
    render(<VehicleManagement vehicle={mockVehicle} onBack={vi.fn()} />);
    expect(screen.getAllByText('B 1234 ABC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('motor')).toBeInTheDocument();
    expect(screen.getByText('Honda Vario')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<VehicleManagement vehicle={mockVehicle} onBack={vi.fn()} />);
    expect(screen.getByText('Kendaraan')).toBeInTheDocument();
  });

  it('switches to edit mode on edit click', () => {
    render(<VehicleManagement vehicle={mockVehicle} onBack={vi.fn()} />);
    fireEvent.click(document.querySelector('.drv-icon-btn'));
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });

  it('calls onSave with updated data', () => {
    const onSave = vi.fn();
    render(<VehicleManagement vehicle={mockVehicle} onBack={vi.fn()} onSave={onSave} />);
    fireEvent.click(document.querySelector('.drv-icon-btn'));
    fireEvent.click(screen.getByText('Simpan'));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ plate: 'B 1234 ABC' }));
  });
});
