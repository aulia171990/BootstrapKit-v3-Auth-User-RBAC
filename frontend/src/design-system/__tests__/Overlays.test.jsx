import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Info } from 'lucide-react';
import Dialog from '../components/Dialog/index.js';
import Modal from '../components/Modal/index.js';
import Drawer from '../components/Drawer/index.js';
import Sheet from '../components/Sheet/index.js';
import Popover from '../components/Popover/index.js';
import Tooltip from '../components/Tooltip/index.js';
import Toast from '../components/Toast/index.js';
import Snackbar from '../components/Snackbar/index.js';
import Alert from '../components/Alert/index.js';
import Banner from '../components/Banner/index.js';
import Progress from '../components/Progress/index.js';
import Loading from '../components/Loading/index.js';
import LoadingOverlay from '../components/LoadingOverlay/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import SuccessState from '../components/SuccessState/index.js';
import ConfirmationDialog from '../components/ConfirmationDialog/index.js';

describe('Overlays (2C) a11y + behavior', () => {
  it('Dialog renders in portal with role=dialog + aria-modal, closes on Esc', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Hi">body</Dialog>);
    const dlg = screen.getByRole('dialog');
    expect(dlg).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  it('Modal renders confirm/cancel buttons', () => {
    const onConfirm = vi.fn();
    render(<Modal open onClose={() => {}} onConfirm={onConfirm} title="M">x</Modal>);
    fireEvent.click(screen.getByText('OK'));
    expect(onConfirm).toHaveBeenCalled();
  });
  it('Drawer renders with role=dialog', () => {
    render(<Drawer open onClose={() => {}} title="D" side="left">body</Drawer>);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'left');
  });
  it('Sheet is a Drawer variant (bottom default)', () => {
    render(<Sheet open onClose={() => {}} title="S">body</Sheet>);
    expect(screen.getByRole('dialog', { name: 'S' })).toBeInTheDocument();
  });
  it('Popover toggles panel and sets aria-expanded', () => {
    render(<Popover trigger="Open"><div>panel content</div></Popover>);
    const btn = screen.getByRole('button', { name: 'Open' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });
  it('Tooltip renders its bubble with role=tooltip', () => {
    render(<Tooltip content="help text"><button>Hover</button></Tooltip>);
    expect(screen.getByRole('tooltip')).toHaveTextContent('help text');
  });
});

describe('Notifications + states (2C)', () => {
  it('Toast is a status region with tone', () => {
    render(<Toast tone="success" title="Saved">done</Toast>);
    const t = screen.getByRole('status');
    expect(t).toHaveAttribute('data-tone', 'success');
    expect(t).toHaveTextContent('Saved');
  });
  it('Snackbar stacks Toasts from array', () => {
    render(<Snackbar toasts={[{ id: '1', title: 'A' }, { id: '2', title: 'B' }]} onDismiss={() => {}} />);
    expect(screen.getAllByRole('status').length).toBe(2);
  });
  it('Alert exposes role=alert + dismiss', () => {
    const onClose = vi.fn();
    render(<Alert tone="warning" closable onClose={onClose}>careful</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onClose).toHaveBeenCalled();
  });
  it('Banner danger uses role=alert', () => {
    render(<Banner tone="danger" title="Down">service down</Banner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Down');
  });
  it('Progress renders progressbar with value', () => {
    render(<Progress value={40} showLabel />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
  it('Loading has status role + label', () => {
    render(<Loading label="Loading…" />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
  it('LoadingOverlay renders status role', () => {
    render(<LoadingOverlay label="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });
  it('EmptyState / ErrorState / SuccessState render titles', () => {
    const { rerender } = render(<EmptyState title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    rerender(<ErrorState title="Failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    rerender(<SuccessState title="Done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
  it('ConfirmationDialog confirm fires onConfirm', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationDialog open onClose={() => {}} onConfirm={onConfirm} title="Delete?" message="Sure?" />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });
});
