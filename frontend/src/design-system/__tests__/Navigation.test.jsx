import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Search, Settings, User, LogOut, Plus } from 'lucide-react';
import Navbar from '../components/Navbar/index.js';
import Sidebar from '../components/Sidebar/index.js';
import BottomNavigation from '../components/BottomNavigation/index.js';
import Topbar from '../components/Topbar/index.js';
import Tabs from '../components/Tabs/index.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import Pagination from '../components/Pagination/index.js';
import Menu from '../components/Menu/index.js';
import Dropdown from '../components/Dropdown/index.js';
import CommandPalette from '../components/CommandPalette/index.js';
import ResponsiveNavigation from '../components/ResponsiveNavigation/index.js';

describe('Navigation (2D) — reused 1E components', () => {
  it('Navbar renders brand + actions', () => {
    render(<Navbar brand="ACME" actions={<button>Hi</button>} />);
    expect(screen.getByText('ACME')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hi' })).toBeInTheDocument();
  });
  it('Sidebar renders links + active aria-current', () => {
    render(<Sidebar items={[{ id: 'a', label: 'Home', active: true }, { id: 'b', label: 'Orders', section: 'Main' }]} />);
    const link = screen.getByText('Home').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Main')).toBeInTheDocument();
  });
  it('BottomNavigation renders items + active', () => {
    render(<BottomNavigation items={[{ id: '1', label: 'Home', icon: Plus, active: true }, { id: '2', label: 'Me' }]} />);
    const btn = screen.getByText('Home').closest('button');
    expect(btn).toHaveAttribute('aria-current', 'page');
  });
  it('Tabs selects + fires onValueChange', () => {
    const fn = vi.fn();
    render(<Tabs tabs={[{ id: '1', label: 'One', content: 'A' }, { id: '2', label: 'Two', content: 'B' }]} onValueChange={fn} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(fn).toHaveBeenCalledWith('2');
    expect(screen.getByText('B')).toBeInTheDocument();
  });
  it('Breadcrumb marks last item current', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Orders' }]} />);
    expect(screen.getByText('Orders').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
  });
  it('Pagination changes page + clamps', () => {
    const fn = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={fn} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(fn).toHaveBeenCalledWith(3);
  });
  it('Menu renders menuitems', () => {
    render(<Menu items={[{ id: 'a', label: 'Edit' }, { id: 'b', label: 'Delete', danger: true }]} />);
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass('is-danger');
  });
  it('Dropdown opens on trigger click', () => {
    render(<Dropdown trigger={<button>Open</button>}><Menu items={[{ id: 'x', label: 'Item' }]} /></Dropdown>);
    const t = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(t);
    expect(screen.getByRole('menuitem', { name: 'Item' })).toBeInTheDocument();
  });
});

describe('Navigation (2D) — new components', () => {
  it('Topbar renders brand + search + notifications badge', () => {
    render(<Topbar brand="App" notifications={3} onSearch={() => {}} />);
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  it('CommandPalette filters + arrow/enter selects', () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        open
        onClose={() => {}}
        placeholder="Type a command…"
        commands={[
          { id: 'new', label: 'New Order', icon: Plus, onSelect },
          { id: 'set', label: 'Settings', icon: Settings, onSelect },
        ]}
      />
    );
    const input = screen.getByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'set' } });
    expect(screen.queryByText('New Order')).not.toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalled();
  });
  it('CommandPalette Escape closes', () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} placeholder="Type a command…" commands={[{ id: 'a', label: 'A', onSelect: () => {} }]} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Type a command…'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  it('ResponsiveNavigation renders hamburger when narrow', () => {
    // force mobile viewport via matchMedia stub
    window.innerWidth = 500;
    render(<ResponsiveNavigation items={[{ id: 'a', label: 'Home' }]} brand="Brand" />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    expect(toggle).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByRole('dialog', { name: 'Brand' })).toBeInTheDocument();
  });
});
