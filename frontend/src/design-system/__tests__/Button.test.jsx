import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import Button from '../components/Button/index.js';
import IconButton from '../components/IconButton/index.js';

describe('Button (2A)', () => {
  it('renders label and variant/size classes', () => {
    render(<Button variant="destructive" size="lg">Delete</Button>);
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).toHaveClass('ds-btn', 'ds-btn--danger', 'ds-btn--lg');
  });

  it('disables while loading and sets aria-busy', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders a spinner (not label icons) while loading', () => {
    const { container } = render(<Button loading leftIcon={Plus}>X</Button>);
    expect(container.querySelector('.ds-btn__ring')).toBeTruthy();
    expect(container.querySelector('.ds-btn__icon')).toBeNull();
  });

  it('is full width when fullWidth', () => {
    render(<Button fullWidth>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('ds-btn--block');
  });

  it('respects disabled', () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('click handler fires', () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Click</Button>);
    screen.getByRole('button').click();
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('IconButton (2A)', () => {
  it('requires aria-label and renders icon', () => {
    const { container } = render(<IconButton icon={Plus} aria-label="Add" />);
    const btn = screen.getByRole('button', { name: 'Add' });
    expect(btn).toHaveClass('ds-btn--circle');
    expect(container.querySelector('.ds-btn__icon')).toBeTruthy();
  });

  it('warns without aria-label (dev only)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<IconButton icon={Plus} />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
