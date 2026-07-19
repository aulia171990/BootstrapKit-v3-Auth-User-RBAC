import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  useOnlineStatus, OfflineBanner, RetryButton, VehicleListSkeleton, FareSkeleton, InlineError,
} from '../ux.jsx';

describe('booking ux primitives (3B-2H)', () => {
  it('OfflineBanner shows retry and calls handler', () => {
    const onRetry = vi.fn();
    render(<OfflineBanner onRetry={onRetry} />);
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Coba lagi/));
    expect(onRetry).toHaveBeenCalled();
  });

  it('RetryButton invokes onRetry', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/Coba lagi/));
    expect(onRetry).toHaveBeenCalled();
  });

  it('VehicleListSkeleton renders placeholder cards', () => {
    const { container } = render(<VehicleListSkeleton count={3} />);
    expect(container.querySelectorAll('.pasv-veh--skeleton').length).toBe(3);
  });

  it('FareSkeleton renders without crashing', () => {
    const { container } = render(<FareSkeleton />);
    expect(container.querySelector('.pasv-fare__sk')).toBeTruthy();
  });

  it('InlineError shows message and retry', () => {
    const onRetry = vi.fn();
    render(<InlineError message="Gagal" onRetry={onRetry} />);
    expect(screen.getByText('Gagal')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Coba lagi/));
    expect(onRetry).toHaveBeenCalled();
  });

  it('useOnlineStatus returns a boolean', () => {
    const Probe = () => {
      const online = useOnlineStatus();
      return <div data-testid="o">{String(online)}</div>;
    };
    render(<Probe />);
    expect(['true', 'false']).toContain(screen.getByTestId('o').textContent);
  });
});
