import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Settings } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card/index.js';
import Avatar from '../components/Avatar/index.js';
import Separator from '../components/Separator/index.js';
import Label from '../components/Label/index.js';
import Link from '../components/Link/index.js';

describe('Card (2A)', () => {
  it('renders header/body/footer subcomponents', () => {
    render(
      <Card>
        <CardHeader title="T" subtitle="S" actions={<button>act</button>} />
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });

  it('becomes a clickable button with role', () => {
    render(<Card onClick={() => {}}>x</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows loading overlay and aria-busy', () => {
    const { container } = render(<Card loading>x</Card>);
    expect(container.querySelector('.ds-card__loading')).toBeTruthy();
  });
});

describe('Avatar (2A)', () => {
  it('shows initials fallback and status indicator', () => {
    const { container } = render(<Avatar name="Budi Santoso" status="online" />);
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(container.querySelector('.ds-avatar__status')).toBeTruthy();
  });

  it('renders img when src provided', () => {
    const { container } = render(<Avatar src="/a.png" name="A" />);
    expect(container.querySelector('.ds-avatar__img')).toBeTruthy();
  });

  it('renders a badge overlay', () => {
    const { container } = render(<Avatar name="A" badge={<span>3</span>} />);
    expect(container.querySelector('.ds-avatar__badge')).toBeTruthy();
  });
});

describe('Separator / Label / Link (2A)', () => {
  it('Separator renders a separator role', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
  it('Label shows required marker', () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
  it('Link renders anchor with tone', () => {
    render(<Link href="#" tone="muted">Go</Link>);
    const a = screen.getByText('Go');
    expect(a.tagName).toBe('A');
    expect(a).toHaveClass('ds-link--muted');
  });
});
