import React, { useState } from 'react';
import { Search, Plus, Settings, User, LogOut, Home, ShoppingCart, MapPin } from 'lucide-react';
import {
  Navbar, Sidebar, BottomNavigation, Topbar, Tabs, Breadcrumb, Pagination,
  Menu, Dropdown, CommandPalette, ResponsiveNavigation,
} from '../index.js';
import { Avatar, Button } from '../index.js';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home, active: true, section: 'Main' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, section: 'Main' },
  { id: 'trips', label: 'Trips', icon: MapPin, section: 'Main' },
];

export const NavExamples = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <Navbar brand="ACME" actions={<Button size="sm">Login</Button>} />
    <Sidebar items={navItems} brand="ACME" />
    <BottomNavigation items={[{ id: 'h', label: 'Home', icon: Home, active: true }, { id: 'o', label: 'Orders', icon: ShoppingCart }]} />
    <Topbar brand="ACME" notifications={3} onSearch={() => {}} user={<Avatar name="Jane" />} userMenu={[{ id: 'p', label: 'Profile', icon: User }, { id: 's', label: 'Settings', icon: Settings }, { id: 'x', label: 'Logout', icon: LogOut, danger: true }]} />
    <Tabs tabs={[{ id: '1', label: 'Active', content: 'Active orders' }, { id: '2', label: 'Done', content: 'Done orders' }]} />
    <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Orders' }]} />
    <Pagination page={3} totalPages={10} onPageChange={() => {}} />
    <Dropdown trigger={<Button size="sm" variant="outline">Menu</Button>}><Menu items={[{ id: 'a', label: 'Edit' }, { id: 'b', label: 'Delete', danger: true }]} /></Dropdown>
    <ResponsiveNavigation items={navItems} brand="ACME" />
  </div>
);

export default NavExamples;
